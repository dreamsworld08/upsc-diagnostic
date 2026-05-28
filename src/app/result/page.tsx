'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultData, RiskLevel } from '@/lib/types';

const RATING_LABELS: { key: keyof ResultData; label: string }[] = [
  { key: 'gsConfidence', label: 'GS Confidence' },
  { key: 'prelimsConfidence', label: 'Prelims Confidence' },
  { key: 'mainsAnswerWriting', label: 'Mains Answer Writing' },
  { key: 'sociologyConfidence', label: 'Sociology Confidence' },
  { key: 'discipline', label: 'Discipline & Consistency' },
  { key: 'revision', label: 'Revision Quality' },
  { key: 'testPractice', label: 'Test Practice Regularity' },
];

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
  };
  const icons: Record<RiskLevel, string> = {
    High: '⚠',
    Medium: '◑',
    Low: '✓',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${styles[level]}`}
    >
      {icons[level]} {level} Priority
    </span>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const isWeak = value <= 2;
  const isMedium = value === 3;
  const barColor = isWeak ? 'bg-red-400' : isMedium ? 'bg-amber-400' : 'bg-green-400';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700">
          {isWeak && (
            <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1.5" />
          )}
          {label}
        </span>
        <span className={`text-sm font-bold ${isWeak ? 'text-red-500' : 'text-gray-600'}`}>
          {value}/5
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('upsc-result');
      if (!stored) {
        router.replace('/diagnostic');
        return;
      }
      setData(JSON.parse(stored));
    } catch {
      router.replace('/diagnostic');
    } finally {
      setLoading(false);
    }
  }, [router]);

  function handleRetake() {
    localStorage.removeItem('upsc-result');
    router.push('/diagnostic');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-navy font-semibold animate-pulse">Loading your diagnosis…</div>
      </div>
    );
  }

  if (!data) return null;

  const weakAreas = RATING_LABELS.filter(({ key }) => (data[key] as number) <= 2);
  const date = new Date(data.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#1e3a6e] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">
          Diagnostic Report — {date}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Hello, {data.name.split(' ')[0]}
        </h1>
        <p className="text-blue-200 text-sm">
          Based on your assessment, here is your personalised UPSC diagnosis.
        </p>
      </div>

      {/* Diagnosis segment */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#b8962e] mb-1">
              Your Diagnosis Segment
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a6e]">{data.segment}</h2>
          </div>
          <RiskBadge level={data.riskLevel} />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-[#b8962e] pl-4">
          {data.description}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-[#f5edd8] rounded-2xl border border-[#b8962e]/30 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#b8962e] mb-2">
          Recommended Program Path
        </p>
        <p className="text-lg font-bold text-[#1e3a6e]">{data.recommendation}</p>
        {weakAreas.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              Focus areas identified:{' '}
              <span className="font-semibold text-red-600">
                {weakAreas.map((a) => a.label).join(' · ')}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Self-assessment breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <h3 className="text-base font-bold text-[#1e3a6e] mb-5">
          Self-Assessment Breakdown
        </h3>
        {RATING_LABELS.map(({ key, label }) => (
          <RatingBar key={key} label={label} value={data[key] as number} />
        ))}
        {weakAreas.length > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            Red dot = area rated 1–2, needs immediate attention
          </p>
        )}
      </div>

      {/* Profile summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-base font-bold text-[#1e3a6e] mb-4">Your Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Target Year', data.targetYear],
            ['Status', data.status],
            ['Attempts', data.attempts || '0'],
            ['Cleared Prelims', data.clearedPrelims],
            ['Written Mains', data.writtenMains],
            ['Interview Stage', data.reachedInterview],
            ['Main Problem', data.mainProblem],
            ['Sociology Interest', data.sociologyInterest],
            ['Optional Subject', data.optionalSubject || '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-0.5">{label}</p>
              <p className="font-semibold text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1e3a6e] rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
        <h3 className="text-xl font-bold mb-2">Ready to start your journey?</h3>
        <p className="text-blue-200 text-sm mb-6">
          Book a free 30-minute counseling call with our UPSC expert to discuss your
          personalised plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/917814302902?text=${encodeURIComponent(
              `Hi, I just completed the UPSC Diagnostic Assessment.\n\nName: ${data.name}\nCity: ${data.city}\nSegment: ${data.segment}\nRecommended Path: ${data.recommendation}\nRisk Level: ${data.riskLevel}\n\nPlease book a free counseling call for me.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#b8962e] text-white rounded-lg font-semibold text-sm hover:bg-[#9a7d22] transition shadow-md"
          >
            Book Free Counseling Call
          </a>
          <button
            onClick={handleRetake}
            className="px-6 py-3 border-2 border-white/30 text-white rounded-lg font-semibold text-sm hover:border-white/60 transition"
          >
            Retake Assessment
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        Report ID: {data.timestamp.slice(0, 10)}-{data.phone.slice(-4)}
      </p>
    </div>
  );
}
