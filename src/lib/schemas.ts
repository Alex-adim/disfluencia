import { z } from 'zod';

export const PatientInfoSchema = z.object({
  childName: z.string().min(1, 'Child name is required'),
  ageYears: z.number().int().min(0).max(18),
  ageMonths: z.number().int().min(0).max(11),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  dateOfAssessment: z.string().min(1, 'Date of assessment is required'),
  examinerName: z.string().min(1, 'Examiner name is required'),
  familyHistoryOfStuttering: z.boolean(),
  durationOfConcernMonths: z.number().int().min(0).max(240),
  previousTherapy: z.boolean(),
  additionalNotes: z.string(),
});

export type PatientInfoFormData = z.infer<typeof PatientInfoSchema>;

export const DisfluencyCountSchema = z.object({
  count: z.number().int().min(0),
  instances: z.array(z.string()),
});

export const AnalysisResultSchema = z.object({
  totalWords: z.number().int().min(0),
  estimatedSyllables: z.number().int().min(0),
  sld: z.object({
    partWordRepetitions: DisfluencyCountSchema,
    singleSyllableWordRepetitions: DisfluencyCountSchema,
    disrhythmicPhonation: DisfluencyCountSchema,
    total: z.number().int().min(0),
  }),
  od: z.object({
    multiSyllableRepetitions: DisfluencyCountSchema,
    revisions: DisfluencyCountSchema,
    incompletePhrases: DisfluencyCountSchema,
    interjections: DisfluencyCountSchema,
    total: z.number().int().min(0),
  }),
  percentSS: z.number().min(0),
  ageNormBand: z.string(),
  normTypicalMax: z.number(),
  normMonitorMax: z.number(),
  secondaryMarkers: z.array(z.string()),
  recommendation: z.enum(['Typical', 'Monitor', 'Refer for Full Evaluation']),
  clinicalNotes: z.string(),
  therapyGoals: z.array(z.string()).nullable(),
});
