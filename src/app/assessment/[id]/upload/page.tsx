'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AudioUploader from '@/components/AudioUploader';
import type { PatientInfo } from '@/types';

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`assessment:${id}:patient`);
    if (!stored) {
      router.push('/assessment/new');
      return;
    }
    setPatientInfo(JSON.parse(stored) as PatientInfo);
  }, [id, router]);

  async function handleUpload(file: File) {
    if (!patientInfo) throw new Error('Patient information not found');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientInfo', JSON.stringify(patientInfo));

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Transcription failed');
    }

    const { transcript, whisperSegments } = await response.json();

    sessionStorage.setItem(`assessment:${id}:transcript`, transcript);
    sessionStorage.setItem(`assessment:${id}:segments`, JSON.stringify(whisperSegments ?? []));

    router.push(`/assessment/${id}/processing`);
  }

  if (!patientInfo) return null;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 no-print">
          <a href="/" className="hover:text-slate-700">Home</a>
          <span>/</span>
          <a href="/assessment/new" className="hover:text-slate-700">New Assessment</a>
          <span>/</span>
          <span className="text-slate-700">Upload Audio</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Upload Audio Recording</h2>
        <p className="text-slate-500 mt-1">
          Upload the child&apos;s Frog Story narrative recording for analysis.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 no-print">
        {['Patient Info', 'Upload Audio', 'Processing', 'Results'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2
                ${i === 1 ? 'bg-blue-600 border-blue-600 text-white' :
                  i < 1 ? 'bg-green-500 border-green-500 text-white' :
                  'border-slate-300 text-slate-400'}`}>
                {i < 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === 1 ? 'text-blue-600' : i < 1 ? 'text-green-600' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < 3 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Recording Guidelines</p>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Use the standard Frog Story picture book (Mayer, 1969) — <em>Frog, Where Are You?</em></li>
              <li>• Child should narrate the entire story while looking at the pictures</li>
              <li>• Minimal examiner prompting (only &ldquo;tell me more&rdquo; if child stops)</li>
              <li>• Record in a quiet environment; avoid background noise</li>
              <li>• Minimum recording length: 2–3 minutes</li>
            </ul>
          </div>
        </div>
      </div>

      <AudioUploader onUpload={handleUpload} />
    </div>
  );
}
