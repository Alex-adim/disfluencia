'use client';

import { useRouter } from 'next/navigation';
import PatientInfoForm from '@/components/PatientInfoForm';
import type { PatientInfoFormData } from '@/lib/schemas';

export default function NewAssessmentPage() {
  const router = useRouter();

  async function handleSubmit(data: PatientInfoFormData) {
    const response = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create assessment');
    }

    const { id } = await response.json();
    router.push(`/assessment/${id}/upload`);
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 no-print">
          <a href="/" className="hover:text-slate-700">Home</a>
          <span>/</span>
          <span className="text-slate-700">New Assessment</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Patient Information</h2>
        <p className="text-slate-500 mt-1">
          Enter the child&apos;s information before uploading the audio sample.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 no-print">
        {['Patient Info', 'Upload Audio', 'Processing', 'Results'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2
                ${i === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < 3 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <PatientInfoForm onSubmit={handleSubmit} />
    </div>
  );
}
