import type { AnalysisResult } from '@/types';

interface Props {
  analysis: AnalysisResult;
}

interface Row {
  code: string;
  label: string;
  type: 'sld' | 'od';
  count: number;
  instances: string[];
}

export default function DisfluencyTable({ analysis }: Props) {
  const rows: Row[] = [
    {
      code: 'PWR',
      label: 'Part-Word Repetition',
      type: 'sld',
      count: analysis.sld.partWordRepetitions.count,
      instances: analysis.sld.partWordRepetitions.instances,
    },
    {
      code: 'SWR',
      label: 'Single-Syllable Word Repetition',
      type: 'sld',
      count: analysis.sld.singleSyllableWordRepetitions.count,
      instances: analysis.sld.singleSyllableWordRepetitions.instances,
    },
    {
      code: 'DP',
      label: 'Disrhythmic Phonation (blocks/prolongations)',
      type: 'sld',
      count: analysis.sld.disrhythmicPhonation.count,
      instances: analysis.sld.disrhythmicPhonation.instances,
    },
    {
      code: 'MWR',
      label: 'Multi-Syllable Word/Phrase Repetition',
      type: 'od',
      count: analysis.od.multiSyllableRepetitions.count,
      instances: analysis.od.multiSyllableRepetitions.instances,
    },
    {
      code: 'REV',
      label: 'Revision',
      type: 'od',
      count: analysis.od.revisions.count,
      instances: analysis.od.revisions.instances,
    },
    {
      code: 'INC',
      label: 'Incomplete Phrase',
      type: 'od',
      count: analysis.od.incompletePhrases.count,
      instances: analysis.od.incompletePhrases.instances,
    },
    {
      code: 'INT',
      label: 'Interjection',
      type: 'od',
      count: analysis.od.interjections.count,
      instances: analysis.od.interjections.instances,
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4 w-16">Code</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4">Type</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 pr-4 w-16">Count</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">Examples</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* SLD header row */}
            <tr>
              <td colSpan={4} className="pt-3 pb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Stuttering-Like Disfluencies (SLD)
                </span>
              </td>
            </tr>

            {rows.filter((r) => r.type === 'sld').map((row) => (
              <tr key={row.code} className="hover:bg-slate-50">
                <td className="py-2 pr-4">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {row.code}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                <td className="py-2 pr-4">
                  <span className={`font-semibold ${row.count > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                    {row.count}
                  </span>
                </td>
                <td className="py-2 text-slate-500 text-xs">
                  {row.instances.length > 0
                    ? row.instances.map((inst, i) => (
                        <span key={i} className="inline-block bg-red-50 text-red-700 px-1.5 py-0.5 rounded mr-1 mb-1 font-mono">
                          {inst}
                        </span>
                      ))
                    : <span className="text-slate-300">—</span>
                  }
                </td>
              </tr>
            ))}

            {/* SLD total */}
            <tr className="bg-red-50">
              <td className="py-2 pr-4" />
              <td className="py-2 pr-4 font-semibold text-red-800 text-xs uppercase">SLD Total</td>
              <td className="py-2 pr-4 font-bold text-red-800">{analysis.sld.total}</td>
              <td className="py-2" />
            </tr>

            {/* OD header row */}
            <tr>
              <td colSpan={4} className="pt-4 pb-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Other Disfluencies (OD)
                </span>
              </td>
            </tr>

            {rows.filter((r) => r.type === 'od').map((row) => (
              <tr key={row.code} className="hover:bg-slate-50">
                <td className="py-2 pr-4">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {row.code}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                <td className="py-2 pr-4">
                  <span className={`font-semibold ${row.count > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                    {row.count}
                  </span>
                </td>
                <td className="py-2 text-slate-500 text-xs">
                  {row.instances.length > 0
                    ? row.instances.map((inst, i) => (
                        <span key={i} className="inline-block bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded mr-1 mb-1 font-mono">
                          {inst}
                        </span>
                      ))
                    : <span className="text-slate-300">—</span>
                  }
                </td>
              </tr>
            ))}

            {/* OD total */}
            <tr className="bg-blue-50">
              <td className="py-2 pr-4" />
              <td className="py-2 pr-4 font-semibold text-blue-800 text-xs uppercase">OD Total</td>
              <td className="py-2 pr-4 font-bold text-blue-800">{analysis.od.total}</td>
              <td className="py-2" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* %SS bar visualization */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">%SS Severity Gauge</span>
          <span className="text-xs text-slate-500">
            {analysis.percentSS.toFixed(1)}% of syllables were stuttered
          </span>
        </div>
        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
          {/* Zones */}
          <div
            className="absolute inset-y-0 left-0 bg-green-200"
            style={{ width: `${Math.min((analysis.normTypicalMax / 10) * 100, 100)}%` }}
          />
          <div
            className="absolute inset-y-0 bg-yellow-200"
            style={{
              left: `${Math.min((analysis.normTypicalMax / 10) * 100, 100)}%`,
              width: `${Math.min(((analysis.normMonitorMax - analysis.normTypicalMax) / 10) * 100, 100)}%`,
            }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-red-200"
            style={{
              left: `${Math.min((analysis.normMonitorMax / 10) * 100, 100)}%`,
            }}
          />
          {/* Marker */}
          <div
            className="absolute inset-y-0 w-1 bg-slate-800 rounded"
            style={{ left: `${Math.min((analysis.percentSS / 10) * 100, 99)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0%</span>
          <span className="text-green-600">Typical &lt;{analysis.normTypicalMax}%</span>
          <span className="text-yellow-600">Monitor &lt;{analysis.normMonitorMax}%</span>
          <span className="text-red-600">Refer &gt;{analysis.normMonitorMax}%</span>
          <span>10%+</span>
        </div>
      </div>
    </div>
  );
}
