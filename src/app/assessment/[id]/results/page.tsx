'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { AssessmentRecord } from '@/types';
import ResultsReport from '@/components/ResultsReport';

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessment?id=${id}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Failed to load assessment');
          return;
        }
        const data = await res.json();
        setRecord(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading results...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading Results</h3>
          <p className="text-sm text-red-700">{error || 'Assessment not found'}</p>
          <a href="/" className="mt-4 inline-block text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
            Start New Assessment
          </a>
        </div>
      </div>
    );
  }

  if (!record.analysis) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Analysis Not Complete</h3>
          <p className="text-sm text-yellow-700">
            {record.status === 'error'
              ? `Analysis failed: ${record.errorMessage}`
              : 'The analysis is not yet complete. Please wait or re-process.'}
          </p>
          <a href={`/assessment/${id}/processing`} className="mt-4 inline-block text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Go to Processing
          </a>
        </div>
      </div>
    );
  }

  return <ResultsReport record={record} />;
}
