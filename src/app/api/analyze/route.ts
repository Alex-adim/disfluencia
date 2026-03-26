import { NextRequest } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/analysis-prompt';
import { AnalysisResultSchema } from '@/lib/schemas';
import type { PatientInfo } from '@/types';

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
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json() as { patientInfo?: PatientInfo; transcript?: string };
        const { patientInfo, transcript } = body;

        if (!patientInfo || !transcript) {
          sendSSE(controller, 'error', { message: 'Missing patientInfo or transcript' });
          controller.close();
          return;
        }

        sendSSE(controller, 'status', { step: 'starting', message: 'Starting disfluency analysis...' });

        const anthropic = getAnthropicClient();
        const userPrompt = buildUserPrompt(patientInfo, transcript);

        sendSSE(controller, 'status', { step: 'analyzing', message: 'Analyzing transcript for disfluencies...' });

        let fullText = '';
        let lastStep = '';

        const claudeStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const event of claudeStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text;

            let nextStep = '';
            if (fullText.includes('"sld"') && !fullText.includes('"od"')) {
              nextStep = 'counting_sld';
            } else if (fullText.includes('"od"') && !fullText.includes('"percentSS"')) {
              nextStep = 'counting_od';
            } else if (fullText.includes('"percentSS"') && !fullText.includes('"recommendation"')) {
              nextStep = 'calculating';
            } else if (fullText.includes('"recommendation"') && !fullText.includes('"therapyGoals"')) {
              nextStep = 'recommendation';
            }

            if (nextStep && nextStep !== lastStep) {
              lastStep = nextStep;
              const messages: Record<string, string> = {
                counting_sld: 'Counting stuttering-like disfluencies...',
                counting_od: 'Counting other disfluencies...',
                calculating: 'Calculating %SS and comparing to age norms...',
                recommendation: 'Generating screening recommendation...',
              };
              sendSSE(controller, 'status', { step: nextStep, message: messages[nextStep] });
            }
          }
        }

        sendSSE(controller, 'status', { step: 'parsing', message: 'Finalizing report...' });

        const jsonStr = extractAnalysisJSON(fullText);
        if (!jsonStr) {
          sendSSE(controller, 'error', { message: 'Failed to extract analysis from response.' });
          controller.close();
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          sendSSE(controller, 'error', { message: 'Failed to parse analysis JSON.' });
          controller.close();
          return;
        }

        const validated = AnalysisResultSchema.safeParse(parsed);
        if (!validated.success) {
          sendSSE(controller, 'error', {
            message: 'Analysis result failed validation.',
            details: validated.error.flatten(),
          });
          controller.close();
          return;
        }

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
