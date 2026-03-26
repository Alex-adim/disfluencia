import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { getAssessment, updateAssessment } from '@/lib/storage';
import type { WhisperSegment } from '@/types';

export const maxDuration = 60;

const DISFLUENCY_PRESERVATION_PROMPT =
  'Transcribe speech exactly as spoken. Preserve ALL repetitions, false starts, ' +
  'incomplete words, hesitations, fillers (um, uh, like, you know), and ' +
  'stuttered syllables (e.g. "b-b-ball", "I- I want", "mmmy"). ' +
  'Do not clean, normalize, or omit any disfluencies. ' +
  'Use dashes for part-word repetitions and hyphens for incomplete words.';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const assessmentId = formData.get('assessmentId') as string | null;

    if (!file || !assessmentId) {
      return NextResponse.json(
        { error: 'Missing file or assessmentId' },
        { status: 400 }
      );
    }

    const record = getAssessment(assessmentId);
    if (!record) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Validate file type
    const allowedTypes = [
      'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav',
      'audio/ogg', 'audio/x-m4a', 'audio/aac', 'video/webm',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|mp4|wav|webm|ogg|m4a|aac)$/i)) {
      return NextResponse.json(
        { error: 'Unsupported audio format. Please upload MP3, MP4, WAV, WebM, OGG, or M4A.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    // Use verbose_json for word-level timestamps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transcription = await (openai.audio.transcriptions.create as any)({
      model: 'whisper-1',
      file,
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
      prompt: DISFLUENCY_PRESERVATION_PROMPT,
    });

    const result = transcription as unknown as {
      text: string;
      segments?: WhisperSegment[];
      words?: { word: string; start: number; end: number }[];
    };

    const transcript = result.text;
    const whisperSegments: WhisperSegment[] = result.segments ?? [];

    updateAssessment(assessmentId, {
      transcript,
      whisperSegments,
      status: 'transcribed',
    });

    return NextResponse.json({
      transcript,
      wordCount: transcript.split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
