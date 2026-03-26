import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Disfluencia — Speech Pathology Fluency Screener',
  description:
    'Evidence-based disfluency screening tool for speech-language pathologists using the Frog Story narrative task.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <header className="no-print bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 leading-none">Disfluencia</h1>
              <p className="text-xs text-slate-500 mt-0.5">Speech Pathology Fluency Screener</p>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="no-print border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
          <p>For clinical use by licensed speech-language pathologists only. Not a substitute for full diagnostic evaluation.</p>
        </footer>
      </body>
    </html>
  );
}
