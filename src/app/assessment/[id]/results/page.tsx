'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { PatientInfo, AnalysisResult } from '@/types';
import ResultsReport from '@/components/ResultsReport';

interface PageData {
  patientInfo: PatientInfo;
  transcript: string;
  analysis: AnalysisResult;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const patientJson = sessionStorage.getItem(`assessment:${id}:patient`);
    const transcript = sessionStorage.getItem(`assessment:${id}:transcript`);
    const analysisJson = sessionStorage.getItem(`assessment:${id}:analysis`);

    if (!patientJson || !analysisJson) {
      setError('Session data not found. Results may have expired or this link was opened in a different browser tab.');
      return;
    }

    try {
      setData({
        patientInfo: JSON.parse(patientJson) as PatientInfo,
        transcript: transcript ?? '',
        analysis: JSON.parse(analysisJson) as AnalysisResult,
      });
    } catch {
      setError('Failed to load results from session storage.');
    }
  }, [id]);

  if (!data && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading results...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading Results</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <a href="/assessment/new" className="inline-block text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start New Assessment
          </a>
        </div>
      </div>
    );
  }

  return (
    <ResultsReport
      patientInfo={data.patientInfo}
      transcript={data.transcript}
      analysis={data.analysis}
    />
  );
}
