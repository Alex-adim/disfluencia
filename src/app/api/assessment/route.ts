import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { PatientInfoSchema } from '@/lib/schemas';
import { setAssessment, getAssessment } from '@/lib/storage';
import type { PatientInfo } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PatientInfoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid patient data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const id = uuidv4();
    const totalAgeMonths = data.ageYears * 12 + data.ageMonths;

    const patientInfo: PatientInfo = {
      id,
      ...data,
      totalAgeMonths,
    };

    setAssessment(id, {
      patientInfo,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const record = getAssessment(id);
  if (!record) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  return NextResponse.json(record);
}
