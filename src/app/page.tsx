import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
        <svg className="w-9 h-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        Frog Story Fluency Screener
      </h2>
      <p className="text-lg text-slate-600 mb-8 leading-relaxed">
        Upload a child&apos;s Frog Story narrative recording to automatically analyze
        disfluencies and generate an evidence-based screening recommendation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-sm">1</span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Patient Info</h3>
          <p className="text-sm text-slate-500">Enter child&apos;s age, history, and examiner details.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-sm">2</span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Upload Audio</h3>
          <p className="text-sm text-slate-500">Upload the Frog Story recording (MP3, WAV, M4A, WebM).</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-sm">3</span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Get Results</h3>
          <p className="text-sm text-slate-500">Review disfluency counts, %SS, and clinical recommendation.</p>
        </div>
      </div>

      <Link
        href="/assessment/new"
        className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors text-lg"
      >
        Start New Assessment
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>

      <p className="mt-6 text-xs text-slate-400">
        Analysis based on ASHA guidelines and Yairi &amp; Ambrose (2005) normative data.
        For use by licensed SLPs only.
      </p>
    </div>
  );
}
