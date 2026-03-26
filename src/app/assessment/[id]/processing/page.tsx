'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AnalysisResult } from '@/types';

interface StatusEvent {
  step: string;
  message: string;
}

const STEPS = [
  { key: 'starting', label: 'Connecting to analysis engine' },
  { key: 'analyzing', label: 'Analyzing transcript for disfluencies' },
  { key: 'counting_sld', label: 'Counting stuttering-like disfluencies' },
  { key: 'counting_od', label: 'Counting other disfluencies' },
  { key: 'calculating', label: 'Calculating %SS and comparing to age norms' },
  { key: 'recommendation', label: 'Generating screening recommendation' },
  { key: 'parsing', label: 'Finalizing report' },
];

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<string>('starting');
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    setStarted(true);

    let cancelled = false;

    async function runAnalysis() {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId: id }),
        });

        if (!response.body) {
          setError('No response body from analysis API');
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          let eventType = '';
          let dataLine = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataLine = line.slice(6).trim();
            } else if (line === '' && eventType && dataLine) {
              try {
                const payload = JSON.parse(dataLine);

                if (eventType === 'status') {
                  const status = payload as StatusEvent;
                  setCompletedSteps((prev) => {
                    const next = new Set(prev);
                    // Mark previous step as completed
                    if (currentStep) next.add(currentStep);
                    return next;
                  });
                  setCurrentStep(status.step);
                } else if (eventType === 'result') {
                  // Mark all steps complete
                  setCompletedSteps(new Set(STEPS.map((s) => s.key)));
                  setCurrentStep('done');
                  setTimeout(() => {
                    if (!cancelled) router.push(`/assessment/${id}/results`);
                  }, 800);
                } else if (eventType === 'error') {
                  setError(payload.message || 'Analysis failed');
                }
              } catch {
                // ignore parse errors for partial lines
              }

              eventType = '';
              dataLine = '';
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Analysis failed');
        }
      }
    }

    runAnalysis();
    return () => { cancelled = true; };
  }, [id, router, started, currentStep]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Analyzing Recording</h2>
        <p className="text-slate-500 mt-1">Please wait while we process the audio sample.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-red-800 mb-2">Analysis Error</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/assessment/${id}/upload`)}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back and Retry
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.has(step.key);
              const isActive = step.key === currentStep;
              const isPending = !isCompleted && !isActive;

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-400">{i + 1}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-sm ${isCompleted ? 'text-green-700 line-through' : isActive ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${currentStep === 'done'
                    ? 100
                    : Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {currentStep === 'done' ? 'Complete! Redirecting...' : 'This may take 30–60 seconds'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
