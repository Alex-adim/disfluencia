import { NextRequest } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';
import { getAssessment, updateAssessment } from '@/lib/storage';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/analysis-prompt';
import { AnalysisResultSchema } from '@/lib/schemas';

export const maxDuration = 60;

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

function extractAnalysisJSON(text: string): string | null {
  const match = text.match(/<analysis>([\s\S]*?)<\/analysis>/);
  return match ? match[1].trim() : null;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { assessmentId } = body;

        if (!assessmentId) {
          sendSSE(controller, 'error', { message: 'Missing assessmentId' });
          controller.close();
          return;
        }

        const record = getAssessment(assessmentId);
        if (!record) {
          sendSSE(controller, 'error', { message: 'Assessment not found' });
          controller.close();
          return;
        }

        if (!record.transcript) {
          sendSSE(controller, 'error', { message: 'No transcript found. Please transcribe audio first.' });
          controller.close();
          return;
        }

        sendSSE(controller, 'status', { step: 'starting', message: 'Starting disfluency analysis...' });

        const anthropic = getAnthropicClient();
        const userPrompt = buildUserPrompt(record.patientInfo, record.transcript);

        sendSSE(controller, 'status', { step: 'analyzing', message: 'Analyzing transcript for disfluencies...' });

        let fullText = '';

        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text;

            // Emit progress hints based on what's been accumulated
            if (fullText.includes('"sld"') && !fullText.includes('"od"')) {
              sendSSE(controller, 'status', {
                step: 'counting_sld',
                message: 'Counting stuttering-like disfluencies...',
              });
            } else if (fullText.includes('"od"') && !fullText.includes('"percentSS"')) {
              sendSSE(controller, 'status', {
                step: 'counting_od',
                message: 'Counting other disfluencies...',
              });
            } else if (fullText.includes('"percentSS"') && !fullText.includes('"recommendation"')) {
              sendSSE(controller, 'status', {
                step: 'calculating',
                message: 'Calculating %SS and comparing to age norms...',
              });
            } else if (fullText.includes('"recommendation"') && !fullText.includes('"therapyGoals"')) {
              sendSSE(controller, 'status', {
                step: 'recommendation',
                message: 'Generating screening recommendation...',
              });
            }
          }
        }

        sendSSE(controller, 'status', { step: 'parsing', message: 'Parsing results...' });

        const jsonStr = extractAnalysisJSON(fullText);
        if (!jsonStr) {
          sendSSE(controller, 'error', {
            message: 'Failed to extract analysis from Claude response. Raw response saved.',
            rawResponse: fullText.slice(0, 500),
          });
          updateAssessment(assessmentId, { status: 'error', errorMessage: 'Failed to parse Claude response' });
          controller.close();
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          sendSSE(controller, 'error', { message: 'Failed to parse analysis JSON.' });
          updateAssessment(assessmentId, { status: 'error', errorMessage: 'JSON parse error' });
          controller.close();
          return;
        }

        const validated = AnalysisResultSchema.safeParse(parsed);
        if (!validated.success) {
          sendSSE(controller, 'error', {
            message: 'Analysis result failed validation.',
            details: validated.error.flatten(),
          });
          updateAssessment(assessmentId, { status: 'error', errorMessage: 'Validation error' });
          controller.close();
          return;
        }

        updateAssessment(assessmentId, {
          analysis: validated.data,
          status: 'analyzed',
        });

        sendSSE(controller, 'result', validated.data);
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        sendSSE(controller, 'error', { message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
