import type { AssessmentRecord } from '@/types';

// In-memory store for development. Replace with Redis/KV/Postgres for production.
const store = new Map<string, AssessmentRecord>();

export function getAssessment(id: string): AssessmentRecord | undefined {
  return store.get(id);
}

export function setAssessment(id: string, record: AssessmentRecord): void {
  store.set(id, record);
}

export function updateAssessment(
  id: string,
  updates: Partial<AssessmentRecord>
): AssessmentRecord | null {
  const existing = store.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  store.set(id, updated);
  return updated;
}

export function deleteAssessment(id: string): void {
  store.delete(id);
}
