'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Step1Data,
  Step2Data,
  Step3Data,
  MAIN_PROBLEMS,
  ResultData,
} from '@/lib/types';
import { calculateDiagnosis } from '@/lib/diagnosis';
import { submitToSheets } from '@/lib/sheets';

const TOTAL_STEPS = 3;

const initialStep1: Step1Data = {
  name: '',
  phone: '',
  email: '',
  city: '',
  targetYear: '',
  status: '',
  optionalSubject: '',
  sociologyInterest: '',
};

const initialStep2: Step2Data = {
  attempts: '',
  clearedPrelims: '',
  writtenMains: '',
  reachedInterview: '',
  mainProblem: '',
};

const initialStep3: Step3Data = {
  gsConfidence: 0,
  prelimsConfidence: 0,
  mainsAnswerWriting: 0,
  sociologyConfidence: 0,
  discipline: 0,
  revision: 0,
  testPractice: 0,
};

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {[1, 2, 3].map((s) => {
          const isCompleted = s < step;
          const isActive = s === step;
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isCompleted
                    ? 'bg-gold-500 border-gold-500 text-white'
                    : isActive
                    ? 'bg-navy border-navy text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : s}
              </div>
              <span
                className={`text-xs mt-1 font-medium hidden sm:block ${
                  isActive ? 'text-navy' : isCompleted ? 'text-gold-500' : 'text-gray-400'
                }`}
              >
                {s === 1 ? 'Student Info' : s === 2 ? 'UPSC Stage' : 'Self Ratings'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-gray-200 rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-navy rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">
        Step {step} of {TOTAL_STEPS}
      </p>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border text-gray-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy transition ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-navy'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-gray-700 border-gray-300 hover:border-navy hover:text-navy'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function RatingButtons({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <FieldLabel required>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-11 h-11 rounded-lg border-2 text-sm font-bold transition-colors ${
              value === n
                ? 'bg-navy border-navy text-white'
                : value > 0 && n <= value
                ? 'bg-navy/10 border-navy/40 text-navy'
                : 'bg-white border-gray-300 text-gray-500 hover:border-navy hover:text-navy'
            }`}
          >
            {n}
          </button>
        ))}
        <div className="ml-2 flex-1 flex justify-between text-[10px] text-gray-400 font-medium">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-navy mb-6 pb-3 border-b-2 border-gold-500/30">
      {children}
    </h2>
  );
}

export default function DiagnosticForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [s1, setS1] = useState<Step1Data>(initialStep1);
  const [s2, setS2] = useState<Step2Data>(initialStep2);
  const [s3, setS3] = useState<Step3Data>(initialStep3);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField1 = (key: keyof Step1Data, val: string) =>
    setS1((prev) => ({ ...prev, [key]: val }));
  const setField2 = (key: keyof Step2Data, val: string) =>
    setS2((prev) => ({ ...prev, [key]: val }));
  const setField3 = (key: keyof Step3Data, val: number) =>
    setS3((prev) => ({ ...prev, [key]: val }));

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!s1.name.trim()) e.name = 'Name is required';
    if (!s1.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10,15}$/.test(s1.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!s1.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(s1.email)) e.email = 'Enter a valid email';
    if (!s1.city.trim()) e.city = 'City is required';
    if (!s1.targetYear) e.targetYear = 'Please select a target year';
    if (!s1.status) e.status = 'Please select your status';
    if (!s1.sociologyInterest) e.sociologyInterest = 'Please select an option';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    const att = parseInt(s2.attempts, 10);
    if (!s2.attempts || isNaN(att) || att < 0) e.attempts = 'Enter a valid number (0 or more)';
    if (!s2.clearedPrelims) e.clearedPrelims = 'Please select an option';
    if (!s2.writtenMains) e.writtenMains = 'Please select an option';
    if (!s2.reachedInterview) e.reachedInterview = 'Please select an option';
    if (!s2.mainProblem) e.mainProblem = 'Please select your main problem area';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    const e: Record<string, string> = {};
    const fields: (keyof Step3Data)[] = [
      'gsConfidence',
      'prelimsConfidence',
      'mainsAnswerWriting',
      'sociologyConfidence',
      'discipline',
      'revision',
      'testPractice',
    ];
    fields.forEach((f) => {
      if (!s3[f]) e[f] = 'Please rate this area';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    if (!validateStep3()) return;
    setIsSubmitting(true);

    const diagnosis = calculateDiagnosis(s1, s2, s3);
    const resultData: ResultData = {
      ...s1,
      ...s2,
      ...s3,
      timestamp: new Date().toISOString(),
      segment: diagnosis.segment,
      recommendation: diagnosis.recommendation,
      riskLevel: diagnosis.riskLevel,
      description: diagnosis.description,
    };

    localStorage.setItem('upsc-result', JSON.stringify(resultData));

    const { success, error } = await submitToSheets(resultData);
    if (!success) {
      console.error('Submission error:', error);
      setSubmitError('Data saved locally but could not sync to sheet. Please screenshot this error: ' + error);
    }

    router.push('/result');
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
      <ProgressBar step={step} />

      {step === 1 && (
        <div>
          <SectionHeader>Step 1: Student Information</SectionHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <Input
                  value={s1.name}
                  onChange={(v) => setField1('name', v)}
                  placeholder="Your full name"
                  error={errors.name}
                />
              </div>
              <div>
                <FieldLabel required>Phone Number</FieldLabel>
                <Input
                  value={s1.phone}
                  onChange={(v) => setField1('phone', v)}
                  placeholder="10-digit mobile number"
                  type="tel"
                  error={errors.phone}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>Email Address</FieldLabel>
                <Input
                  value={s1.email}
                  onChange={(v) => setField1('email', v)}
                  placeholder="your@email.com"
                  type="email"
                  error={errors.email}
                />
              </div>
              <div>
                <FieldLabel required>City</FieldLabel>
                <Input
                  value={s1.city}
                  onChange={(v) => setField1('city', v)}
                  placeholder="Your city"
                  error={errors.city}
                />
              </div>
            </div>

            <div>
              <FieldLabel required>Target Year</FieldLabel>
              <RadioGroup
                options={['2026', '2027', '2028', 'Not Sure']}
                value={s1.targetYear}
                onChange={(v) => setField1('targetYear', v)}
                error={errors.targetYear}
              />
            </div>

            <div>
              <FieldLabel required>Current Status</FieldLabel>
              <RadioGroup
                options={['Full-time', 'Working', 'College Student']}
                value={s1.status}
                onChange={(v) => setField1('status', v)}
                error={errors.status}
              />
            </div>

            <div>
              <FieldLabel>Optional Subject (if selected)</FieldLabel>
              <Input
                value={s1.optionalSubject}
                onChange={(v) => setField1('optionalSubject', v)}
                placeholder="e.g. Sociology, History, Public Administration…"
              />
            </div>

            <div>
              <FieldLabel required>Interested in Sociology as Optional?</FieldLabel>
              <RadioGroup
                options={['Yes', 'No', 'Maybe']}
                value={s1.sociologyInterest}
                onChange={(v) => setField1('sociologyInterest', v)}
                error={errors.sociologyInterest}
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionHeader>Step 2: Your UPSC Journey</SectionHeader>
          <div className="space-y-5">
            <div>
              <FieldLabel required>Number of Attempts Given</FieldLabel>
              <Input
                value={s2.attempts}
                onChange={(v) => setField2('attempts', v)}
                placeholder="0 if not yet appeared"
                type="number"
                error={errors.attempts}
              />
            </div>

            <div>
              <FieldLabel required>Have you cleared Prelims?</FieldLabel>
              <RadioGroup
                options={['Yes', 'No']}
                value={s2.clearedPrelims}
                onChange={(v) => setField2('clearedPrelims', v)}
                error={errors.clearedPrelims}
              />
            </div>

            <div>
              <FieldLabel required>Have you written Mains?</FieldLabel>
              <RadioGroup
                options={['Yes', 'No']}
                value={s2.writtenMains}
                onChange={(v) => setField2('writtenMains', v)}
                error={errors.writtenMains}
              />
            </div>

            <div>
              <FieldLabel required>Have you reached the Interview stage?</FieldLabel>
              <RadioGroup
                options={['Yes', 'No']}
                value={s2.reachedInterview}
                onChange={(v) => setField2('reachedInterview', v)}
                error={errors.reachedInterview}
              />
            </div>

            <div>
              <FieldLabel required>What is your main problem area right now?</FieldLabel>
              <div>
                <div className="flex flex-wrap gap-2">
                  {MAIN_PROBLEMS.map((prob) => (
                    <button
                      key={prob}
                      type="button"
                      onClick={() => setField2('mainProblem', prob)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        s2.mainProblem === prob
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-navy hover:text-navy'
                      }`}
                    >
                      {prob}
                    </button>
                  ))}
                </div>
                {errors.mainProblem && (
                  <p className="text-red-500 text-xs mt-1">{errors.mainProblem}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <SectionHeader>Step 3: Honest Self-Assessment</SectionHeader>
          <p className="text-sm text-gray-500 mb-6">
            Rate each area on a scale of <strong>1 (Very Low)</strong> to{' '}
            <strong>5 (Very High)</strong>. Be honest — this helps us give you the most
            accurate diagnosis.
          </p>
          <RatingButtons
            label="GS (General Studies) Confidence"
            value={s3.gsConfidence}
            onChange={(v) => setField3('gsConfidence', v)}
            error={errors.gsConfidence}
          />
          <RatingButtons
            label="Prelims Confidence"
            value={s3.prelimsConfidence}
            onChange={(v) => setField3('prelimsConfidence', v)}
            error={errors.prelimsConfidence}
          />
          <RatingButtons
            label="Mains Answer Writing"
            value={s3.mainsAnswerWriting}
            onChange={(v) => setField3('mainsAnswerWriting', v)}
            error={errors.mainsAnswerWriting}
          />
          <RatingButtons
            label="Sociology Optional Confidence"
            value={s3.sociologyConfidence}
            onChange={(v) => setField3('sociologyConfidence', v)}
            error={errors.sociologyConfidence}
          />
          <RatingButtons
            label="Discipline & Consistency"
            value={s3.discipline}
            onChange={(v) => setField3('discipline', v)}
            error={errors.discipline}
          />
          <RatingButtons
            label="Revision Quality"
            value={s3.revision}
            onChange={(v) => setField3('revision', v)}
            error={errors.revision}
          />
          <RatingButtons
            label="Test Practice Regularity"
            value={s3.testPractice}
            onChange={(v) => setField3('testPractice', v)}
            error={errors.testPractice}
          />
        </div>
      )}

      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 break-all">
          ⚠ {submitError}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 sm:flex-none px-6 py-3 border-2 border-navy text-navy rounded-lg font-semibold text-sm hover:bg-navy/5 transition"
          >
            ← Back
          </button>
        )}
        <div className="flex-1" />
        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-navy text-white rounded-lg font-semibold text-sm hover:bg-navy-800 transition shadow-md"
          >
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gold-500 text-white rounded-lg font-semibold text-sm hover:bg-gold-600 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating...' : 'Get My Diagnosis →'}
          </button>
        )}
      </div>
    </div>
  );
}
