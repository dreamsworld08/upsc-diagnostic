import DiagnosticForm from '@/components/DiagnosticForm';

export default function DiagnosticPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a6e] mb-2">
          UPSC Preparation Diagnostic
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Answer honestly. This 3-step assessment takes under 3 minutes and gives you a
          personalised roadmap for your UPSC journey.
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
          <span>✓ Free & Confidential</span>
          <span>✓ No Login Required</span>
          <span>✓ Instant Result</span>
        </div>
      </div>
      <DiagnosticForm />
    </div>
  );
}
