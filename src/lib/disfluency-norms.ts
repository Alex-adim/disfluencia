import type { Recommendation } from '@/types';

interface NormBand {
  label: string;
  minMonths: number;
  maxMonths: number;
  typicalMax: number;  // %SS below this = Typical
  monitorMax: number;  // %SS below this = Monitor; above = Refer
}

// Based on: Yairi & Ambrose (2005), Guitar (2019), ASHA fluency guidelines
const NORM_BANDS: NormBand[] = [
  { label: '24–35 months', minMonths: 24, maxMonths: 35, typicalMax: 3.0, monitorMax: 6.0 },
  { label: '36–47 months', minMonths: 36, maxMonths: 47, typicalMax: 3.0, monitorMax: 5.5 },
  { label: '48–59 months', minMonths: 48, maxMonths: 59, typicalMax: 3.0, monitorMax: 5.0 },
  { label: '60–71 months', minMonths: 60, maxMonths: 71, typicalMax: 2.5, monitorMax: 4.5 },
  { label: '72–83 months', minMonths: 72, maxMonths: 83, typicalMax: 2.5, monitorMax: 4.0 },
  { label: '84+ months',   minMonths: 84, maxMonths: Infinity, typicalMax: 2.0, monitorMax: 3.5 },
];

export function getNormBand(ageMonths: number): NormBand {
  const band = NORM_BANDS.find(
    (b) => ageMonths >= b.minMonths && ageMonths <= b.maxMonths
  );
  // Default to oldest band if age is below 24 months (unusual for this task)
  return band ?? NORM_BANDS[NORM_BANDS.length - 1];
}

export function getBaseRecommendation(
  percentSS: number,
  ageMonths: number
): Recommendation {
  const band = getNormBand(ageMonths);
  if (percentSS < band.typicalMax) return 'Typical';
  if (percentSS < band.monitorMax) return 'Monitor';
  return 'Refer for Full Evaluation';
}

export function escalateRecommendation(
  recommendation: Recommendation
): Recommendation {
  if (recommendation === 'Typical') return 'Monitor';
  if (recommendation === 'Monitor') return 'Refer for Full Evaluation';
  return 'Refer for Full Evaluation';
}

export interface RiskFactor {
  key: string;
  label: string;
  appliesTo: (ageMonths: number, gender: string) => boolean;
}

// Secondary markers that escalate the recommendation by one level
export const SECONDARY_RISK_FACTORS: RiskFactor[] = [
  {
    key: 'family_history',
    label: 'Family history of persistent stuttering',
    appliesTo: () => true,
  },
  {
    key: 'duration_over_6mo',
    label: 'Stuttering duration > 6 months',
    appliesTo: () => true,
  },
  {
    key: 'male_over_42mo',
    label: 'Male, age > 42 months (lower natural recovery rate)',
    appliesTo: (ageMonths, gender) => gender === 'male' && ageMonths > 42,
  },
  {
    key: 'physical_tension',
    label: 'Physical tension or secondary behaviors observed',
    appliesTo: () => true,
  },
  {
    key: 'avoidance',
    label: 'Communication avoidance behaviors noted',
    appliesTo: () => true,
  },
];

export { NORM_BANDS };
