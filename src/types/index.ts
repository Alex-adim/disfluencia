export interface PatientInfo {
  id: string;
  childName: string;
  ageYears: number;
  ageMonths: number; // additional months beyond full years
  totalAgeMonths: number; // computed: ageYears * 12 + ageMonths
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfAssessment: string; // ISO date string
  examinerName: string;
  familyHistoryOfStuttering: boolean;
  durationOfConcernMonths: number;
  previousTherapy: boolean;
  additionalNotes: string;
}

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WhisperWord[];
}

export interface DisfluencyCount {
  count: number;
  instances: string[];
}

export interface SLDCounts {
  partWordRepetitions: DisfluencyCount;
  singleSyllableWordRepetitions: DisfluencyCount;
  disrhythmicPhonation: DisfluencyCount;
  total: number;
}

export interface ODCounts {
  multiSyllableRepetitions: DisfluencyCount;
  revisions: DisfluencyCount;
  incompletePhrases: DisfluencyCount;
  interjections: DisfluencyCount;
  total: number;
}

export type Recommendation = 'Typical' | 'Monitor' | 'Refer for Full Evaluation';

export interface AnalysisResult {
  totalWords: number;
  estimatedSyllables: number;
  sld: SLDCounts;
  od: ODCounts;
  percentSS: number;
  ageNormBand: string;
  normTypicalMax: number;
  normMonitorMax: number;
  secondaryMarkers: string[];
  recommendation: Recommendation;
  clinicalNotes: string;
  therapyGoals: string[] | null;
}

export type AssessmentStatus = 'pending' | 'transcribed' | 'analyzed' | 'error';

export interface AssessmentRecord {
  patientInfo: PatientInfo;
  transcript?: string;
  whisperSegments?: WhisperSegment[];
  analysis?: AnalysisResult;
  status: AssessmentStatus;
  errorMessage?: string;
  createdAt: string;
}
