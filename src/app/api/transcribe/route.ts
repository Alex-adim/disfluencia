import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { PatientInfoSchema } from '@/lib/schemas';
import type { WhisperSegment, PatientInfo } from '@/types';

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
    const patientInfoJson = formData.get('patientInfo') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    if (!patientInfoJson) {
      return NextResponse.json({ error: 'Missing patient information' }, { status: 400 });
    }

    let patientInfo: PatientInfo;
    try {
      patientInfo = JSON.parse(patientInfoJson) as PatientInfo;
    } catch {
      return NextResponse.json({ error: 'Invalid patient information JSON' }, { status: 400 });
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
    };

    return NextResponse.json({
      transcript: result.text,
      whisperSegments: result.segments ?? [],
      wordCount: result.text.split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
