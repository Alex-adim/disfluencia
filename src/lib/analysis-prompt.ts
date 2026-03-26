import type { PatientInfo } from '@/types';
import { getNormBand } from './disfluency-norms';

export const SYSTEM_PROMPT = `You are a licensed speech-language pathologist (SLP) specializing in childhood fluency disorders. You have extensive expertise in analyzing transcripts from the "Frog Story" (Mayer 1969) picture narrative task to produce structured disfluency screening reports.

You follow ASHA (American Speech-Language-Hearing Association) guidelines and the Stuttering Severity Instrument-4 (SSI-4) framework. Your analyses are evidence-based, clinically rigorous, and formatted for direct use in clinical documentation.

DISFLUENCY TAXONOMY:

Stuttering-Like Disfluencies (SLD) — diagnostically significant:
- PWR (Part-Word Repetition): Repetition of a sound or syllable within a word. Examples: "b-b-ball", "sta-sta-star", "I wa-wa-want"
- SWR (Single-Syllable Whole-Word Repetition): Repetition of a single-syllable word. Examples: "I- I- I want", "the- the dog ran", "and- and then"
- DP (Disrhythmic Phonation): Includes sound prolongations ("sssun", "mmmy"), blocks (silent or audible struggle before a sound, often marked as [pause] or noted in context), and broken words (interruption mid-word with audible tension). Examples: "----dog", "mmmmy", "[block] ball"

Other Disfluencies (OD) — typically not diagnostically significant when occurring alone:
- MWR (Multi-Syllable Word or Phrase Repetition): "I want- I want to go", "the big- the big frog"
- REV (Revision): Change in the grammatical structure or content mid-utterance. "He was- they were running", "The boy- the frog jumped"
- INC (Incomplete Phrase): Utterance abandoned before completion. "The boy was going to- and then the frog"
- INT (Interjection): Filler words inserted in the speech stream. "um", "uh", "like", "you know", "well", "so"

IMPORTANT INSTRUCTIONS:
1. Count each discrete disfluency event as one instance (e.g., "b-b-ball" = 1 PWR, not 2)
2. A single word can have multiple disfluency types simultaneously
3. For %SS calculation: use SLD total divided by estimated syllables × 100
4. Estimate syllables by counting each syllable in the transcript (not just words)
5. Be conservative: when uncertain whether something is a disfluency, note it in clinical notes rather than inflate counts
6. Always respond with valid JSON wrapped in <analysis>...</analysis> XML tags`;

export function buildUserPrompt(
  patientInfo: PatientInfo,
  transcript: string
): string {
  const norm = getNormBand(patientInfo.totalAgeMonths);
  const ageDisplay = `${patientInfo.ageYears} years, ${patientInfo.ageMonths} months (${patientInfo.totalAgeMonths} months total)`;

  const riskFactors = [
    patientInfo.familyHistoryOfStuttering && '- Family history of persistent stuttering reported',
    patientInfo.durationOfConcernMonths > 6 && `- Duration of concern: ${patientInfo.durationOfConcernMonths} months (> 6 months)`,
    patientInfo.gender === 'male' && patientInfo.totalAgeMonths > 42 && '- Male, age > 42 months (elevated persistence risk)',
    patientInfo.previousTherapy && '- Child has received previous speech therapy',
  ].filter(Boolean).join('\n');

  return `PATIENT INFORMATION
Child Name: ${patientInfo.childName}
Age: ${ageDisplay}
Gender: ${patientInfo.gender}
Date of Assessment: ${patientInfo.dateOfAssessment}
Examiner: ${patientInfo.examinerName}
${patientInfo.additionalNotes ? `Additional Clinical Notes from Examiner:\n${patientInfo.additionalNotes}` : ''}

KNOWN RISK FACTORS
${riskFactors || 'None reported'}

AGE-APPROPRIATE NORMS (${norm.label})
- Typical: %SS < ${norm.typicalMax}%
- Monitor: %SS ${norm.typicalMax}%–${norm.monitorMax}%
- Refer for Full Evaluation: %SS > ${norm.monitorMax}%

TRANSCRIPT (verbatim from Frog Story narrative task, disfluencies preserved)
---
${transcript}
---

ANALYSIS TASK
1. Read through the entire transcript carefully
2. Identify every disfluency instance and its type (PWR, SWR, DP, MWR, REV, INC, INT)
3. Count each category, providing up to 5 representative example instances per category
4. Count the total syllables in the transcript (count each syllable, not words)
5. Calculate %SS = (SLD total / estimated syllables) × 100, rounded to 1 decimal place
6. Compare %SS to the age norms above to determine base recommendation
7. Note any secondary risk factors from the transcript content or examiner notes that would escalate the recommendation (physical tension cues, avoidance, etc.)
8. Apply any escalations: each secondary marker moves recommendation up one level (Typical→Monitor, Monitor→Refer)
9. Write clinical notes (2–4 sentences) summarizing the fluency profile
10. If recommendation is "Refer for Full Evaluation": propose 2–4 SMART, evidence-based therapy goals appropriate for the child's age and disfluency profile
11. If recommendation is "Monitor" or "Typical": therapyGoals should be null

Respond ONLY with valid JSON inside <analysis>...</analysis> tags. No other text before or after.

<analysis>
{
  "totalWords": <integer>,
  "estimatedSyllables": <integer>,
  "sld": {
    "partWordRepetitions": { "count": <integer>, "instances": [<up to 5 examples>] },
    "singleSyllableWordRepetitions": { "count": <integer>, "instances": [<up to 5 examples>] },
    "disrhythmicPhonation": { "count": <integer>, "instances": [<up to 5 examples>] },
    "total": <integer>
  },
  "od": {
    "multiSyllableRepetitions": { "count": <integer>, "instances": [<up to 5 examples>] },
    "revisions": { "count": <integer>, "instances": [<up to 5 examples>] },
    "incompletePhrases": { "count": <integer>, "instances": [<up to 5 examples>] },
    "interjections": { "count": <integer>, "instances": [<up to 5 examples>] },
    "total": <integer>
  },
  "percentSS": <float, 1 decimal>,
  "ageNormBand": "${norm.label}",
  "normTypicalMax": ${norm.typicalMax},
  "normMonitorMax": ${norm.monitorMax},
  "secondaryMarkers": [<list of secondary markers found, or empty array>],
  "recommendation": <"Typical" | "Monitor" | "Refer for Full Evaluation">,
  "clinicalNotes": "<2-4 sentence clinical summary>",
  "therapyGoals": <array of 2-4 SMART goal strings, or null>
}
</analysis>`;
}
