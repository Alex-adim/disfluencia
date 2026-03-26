'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientInfoSchema, type PatientInfoFormData } from '@/lib/schemas';

interface Props {
  onSubmit: (data: PatientInfoFormData) => Promise<void>;
}

export default function PatientInfoForm({ onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientInfoFormData>({
    resolver: zodResolver(PatientInfoSchema),
    defaultValues: {
      ageYears: 0,
      ageMonths: 0,
      gender: 'male',
      dateOfAssessment: new Date().toISOString().split('T')[0],
      familyHistoryOfStuttering: false,
      durationOfConcernMonths: 0,
      previousTherapy: false,
      additionalNotes: '',
    },
  });

  async function submit(data: PatientInfoFormData) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save patient information');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* Child Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Child Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Child&apos;s Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('childName')}
              type="text"
              placeholder="First name or initials"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.childName && (
              <p className="text-xs text-red-600 mt-1">{errors.childName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    {...register('ageYears', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={18}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 px-2 bg-slate-50 border-l border-slate-300 py-2 whitespace-nowrap">yr</span>
                </div>
                {errors.ageYears && (
                  <p className="text-xs text-red-600 mt-1">{errors.ageYears.message}</p>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    {...register('ageMonths', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    max={11}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 px-2 bg-slate-50 border-l border-slate-300 py-2 whitespace-nowrap">mo</span>
                </div>
                {errors.ageMonths && (
                  <p className="text-xs text-red-600 mt-1">{errors.ageMonths.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register('gender')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Assessment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date of Assessment <span className="text-red-500">*</span>
            </label>
            <input
              {...register('dateOfAssessment')}
              type="date"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateOfAssessment && (
              <p className="text-xs text-red-600 mt-1">{errors.dateOfAssessment.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Examiner Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('examinerName')}
              type="text"
              placeholder="SLP name / credential"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.examinerName && (
              <p className="text-xs text-red-600 mt-1">{errors.examinerName.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Clinical History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          Clinical History
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration of fluency concern (months)
            </label>
            <input
              {...register('durationOfConcernMonths', { valueAsNumber: true })}
              type="number"
              min={0}
              max={240}
              placeholder="0"
              className="w-full sm:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Duration &gt; 6 months is a risk factor for persistent stuttering</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('familyHistoryOfStuttering')}
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Family history of persistent stuttering</span>
                <p className="text-xs text-slate-500">First-degree relative (parent, sibling) with persistent stuttering</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('previousTherapy')}
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Previous speech-language therapy</span>
                <p className="text-xs text-slate-500">Child has received speech therapy services in the past</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional clinical notes
            </label>
            <textarea
              {...register('additionalNotes')}
              rows={4}
              placeholder="Describe any observed behaviors: physical tension, eye contact, secondary mannerisms, parent concerns, language history, hearing status, etc."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue to Audio Upload
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
