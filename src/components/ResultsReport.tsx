'use client';

import type { AssessmentRecord, Recommendation } from '@/types';
import DisfluencyTable from './DisfluencyTable';

interface Props {
  record: AssessmentRecord;
}

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { bg: string; border: string; text: string; icon: string; description: string }
> = {
  'Typical': {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: '✓',
    description: 'Fluency is within normal limits for the child\'s age. No intervention indicated at this time.',
  },
  'Monitor': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: '⚠',
    description: 'Fluency is in the borderline range. Monitor every 2–3 months and refer if disfluencies increase or persist.',
  },
  'Refer for Full Evaluation': {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: '!',
    description: 'Fluency is outside normal limits. A comprehensive speech-language evaluation is recommended.',
  },
};

function formatAge(patient: AssessmentRecord['patientInfo']): string {
  const { ageYears, ageMonths } = patient;
  const parts = [];
  if (ageYears > 0) parts.push(`${ageYears} year${ageYears !== 1 ? 's' : ''}`);
  if (ageMonths > 0 || ageYears === 0) parts.push(`${ageMonths} month${ageMonths !== 1 ? 's' : ''}`);
  return parts.join(', ');
}

export default function ResultsReport({ record }: Props) {
  const { patientInfo, analysis, transcript } = record;
  if (!analysis) return null;

  const config = RECOMMENDATION_CONFIG[analysis.recommendation];
  const assessmentDate = new Date(patientInfo.dateOfAssessment).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const percentSSColor =
    analysis.recommendation === 'Typical' ? 'text-green-600' :
    analysis.recommendation === 'Monitor' ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="print-full-width">
      {/* Nav bar */}
      <div className="no-print mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-slate-700">Home</a>
          <span>/</span>
          <span className="text-slate-700">Results</span>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Report header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fluency Screening Report</h2>
            <p className="text-sm text-slate-500 mt-0.5">Frog Story Narrative Task (Mayer, 1969)</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Date: <span className="text-slate-700 font-medium">{assessmentDate}</span></p>
            <p>Examiner: <span className="text-slate-700 font-medium">{patientInfo.examinerName}</span></p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Child</p>
            <p className="font-medium text-slate-800">{patientInfo.childName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Age</p>
            <p className="font-medium text-slate-800">{formatAge(patientInfo)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Gender</p>
            <p className="font-medium text-slate-800 capitalize">{patientInfo.gender.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Norm Band</p>
            <p className="font-medium text-slate-800">{analysis.ageNormBand}</p>
          </div>
        </div>
      </div>

      {/* Recommendation banner */}
      <div className={`border-2 ${config.border} ${config.bg} rounded-xl p-5 mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${config.border} ${config.text} bg-white flex-shrink-0`}>
            {config.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Screening Recommendation</p>
            <p className={`text-xl font-bold ${config.text}`}>{analysis.recommendation}</p>
            <p className={`text-sm mt-0.5 ${config.text} opacity-80`}>{config.description}</p>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${percentSSColor}`}>{analysis.percentSS.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">%SS (Stuttered Syllables)</p>
          <p className="text-xs text-slate-400 mt-0.5">Typical &lt; {analysis.normTypicalMax}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{analysis.sld.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total SLD</p>
          <p className="text-xs text-slate-400 mt-0.5">Stuttering-Like Disfluencies</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{analysis.od.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total OD</p>
          <p className="text-xs text-slate-400 mt-0.5">Other Disfluencies</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{analysis.estimatedSyllables}</p>
          <p className="text-xs text-slate-500 mt-1">Syllables</p>
          <p className="text-xs text-slate-400 mt-0.5">{analysis.totalWords} words</p>
        </div>
      </div>

      {/* Disfluency breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h3 className="font-semibold text-slate-800 mb-4">Disfluency Analysis</h3>
        <DisfluencyTable analysis={analysis} />
      </div>

      {/* Secondary markers */}
      {analysis.secondaryMarkers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Factors Identified
          </h3>
          <ul className="space-y-1">
            {analysis.secondaryMarkers.map((marker, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                {marker}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinical notes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <h3 className="font-semibold text-slate-800 mb-2">Clinical Notes</h3>
        <p className="text-sm text-slate-700 leading-relaxed">{analysis.clinicalNotes}</p>
      </div>

      {/* Therapy goals */}
      {analysis.therapyGoals && analysis.therapyGoals.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-slate-800 mb-3">Suggested Therapy Goals</h3>
          <p className="text-xs text-slate-500 mb-3">
            Evidence-based goals for consideration if full evaluation confirms diagnosis. Goals should be
            individualized following comprehensive assessment.
          </p>
          <ol className="space-y-3">
            {analysis.therapyGoals.map((goal, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{goal}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-slate-800 mb-2">Verbatim Transcript</h3>
          <p className="text-xs text-slate-400 mb-3">Auto-generated by Whisper ASR — disfluencies preserved as spoken</p>
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}

      {/* Norms reference */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-xs text-slate-500">
        <p className="font-medium text-slate-600 mb-1">References & Normative Data</p>
        <p>Yairi, E., &amp; Ambrose, N. (2005). <em>Early Childhood Stuttering.</em> Pro-Ed.</p>
        <p>Guitar, B. (2019). <em>Stuttering: An Integrated Approach to its Nature and Treatment</em> (5th ed.). Lippincott.</p>
        <p>ASHA. (2016). Scope of practice in speech-language pathology. American Speech-Language-Hearing Association.</p>
        <p className="mt-2 text-slate-400">
          This report is a screening tool only and does not constitute a diagnosis. Results should be interpreted
          by a licensed SLP in conjunction with clinical observation and standardized assessment.
        </p>
      </div>

      {/* Start new assessment */}
      <div className="no-print text-center">
        <a
          href="/assessment/new"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Assessment
        </a>
      </div>
    </div>
  );
}
