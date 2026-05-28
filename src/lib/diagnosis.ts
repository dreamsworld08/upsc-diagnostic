import { Step1Data, Step2Data, Step3Data, DiagnosisResult } from './types';

const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  'Repeated Prelims Blocked':
    'You have attempted the exam multiple times but are yet to clear Prelims. This is a critical stage requiring targeted intervention on fundamentals, CSAT, and revision strategy.',
  'Mains Entry Student':
    'Congratulations on clearing Prelims! You are now entering Mains territory. Structured answer writing and GS depth are your immediate priorities.',
  'Interview Stage but Optional Drag':
    'You have reached the Interview stage, which is commendable. However, your Optional subject confidence needs strengthening before the next cycle.',
  'Sociology Bottleneck':
    'You have chosen Sociology as your Optional but the confidence level suggests gaps in foundation or practice. A focused Sociology program can unlock significant marks.',
  'Mentorship Needed':
    'Your self-assessment indicates challenges with consistency and revision. A structured mentorship programme with weekly accountability can transform your preparation.',
  'Foundation Needed':
    'You are at the early stage of your UPSC journey. A comprehensive foundation programme covering GS and your Optional will set you on the right path.',
  'Strategy Refinement':
    'You are on the right track with a reasonable preparation base. Fine-tuning your strategy, plugging specific gaps, and sharpening test practice will accelerate results.',
};

export function calculateDiagnosis(
  s1: Step1Data,
  s2: Step2Data,
  s3: Step3Data
): DiagnosisResult {
  const attempts = parseInt(s2.attempts, 10) || 0;
  const clearedPrelims = s2.clearedPrelims === 'Yes';
  const writtenMains = s2.writtenMains === 'Yes';
  const reachedInterview = s2.reachedInterview === 'Yes';
  const sociologyInterest = s1.sociologyInterest;

  const {
    gsConfidence,
    sociologyConfidence,
    discipline,
    revision,
  } = s3;

  let segment = 'Strategy Refinement';

  if (attempts >= 2 && !clearedPrelims) {
    segment = 'Repeated Prelims Blocked';
  } else if (clearedPrelims && !writtenMains) {
    segment = 'Mains Entry Student';
  } else if (reachedInterview && sociologyConfidence <= 3) {
    segment = 'Interview Stage but Optional Drag';
  } else if (sociologyInterest === 'Yes' && sociologyConfidence <= 3) {
    segment = 'Sociology Bottleneck';
  } else if (discipline <= 2 || revision <= 2) {
    segment = 'Mentorship Needed';
  } else if (attempts <= 1 && gsConfidence <= 2) {
    segment = 'Foundation Needed';
  }

  const RECOMMENDATIONS: Record<string, string> = {
    'Repeated Prelims Blocked': 'Prelims Program + CSAT + Revision Plan',
    'Mains Entry Student': 'Mains Answer Writing + GS Test Series',
    'Interview Stage but Optional Drag': 'Advanced Sociology Answer Writing + Mentorship',
    'Sociology Bottleneck': 'Sociology Foundation/Crash + Sociology Test Series',
    'Mentorship Needed': 'Mentorship + Weekly Tracking',
    'Foundation Needed': 'GS Foundation + Optional Foundation',
    'Strategy Refinement': 'Counseling Call + Test Practice',
  };

  const RISK_LEVELS: Record<string, DiagnosisResult['riskLevel']> = {
    'Repeated Prelims Blocked': 'High',
    'Mains Entry Student': 'Medium',
    'Interview Stage but Optional Drag': 'Medium',
    'Sociology Bottleneck': 'Medium',
    'Mentorship Needed': 'High',
    'Foundation Needed': 'Medium',
    'Strategy Refinement': 'Low',
  };

  return {
    segment,
    recommendation: RECOMMENDATIONS[segment],
    riskLevel: RISK_LEVELS[segment],
    description: SEGMENT_DESCRIPTIONS[segment],
  };
}
