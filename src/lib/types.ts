export type TargetYear = '2026' | '2027' | '2028' | 'Not Sure';
export type Status = 'Full-time' | 'Working' | 'College Student';
export type SociologyInterest = 'Yes' | 'No' | 'Maybe';
export type YesNo = 'Yes' | 'No';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export const MAIN_PROBLEMS = [
  'Prelims',
  'Mains GS',
  'Sociology Optional',
  'Answer Writing',
  'Discipline',
  'Confusion',
  'Burnout',
] as const;

export interface Step1Data {
  name: string;
  phone: string;
  email: string;
  city: string;
  targetYear: TargetYear | '';
  status: Status | '';
  optionalSubject: string;
  sociologyInterest: SociologyInterest | '';
}

export interface Step2Data {
  attempts: string;
  clearedPrelims: YesNo | '';
  writtenMains: YesNo | '';
  reachedInterview: YesNo | '';
  mainProblem: string;
}

export interface Step3Data {
  gsConfidence: number;
  prelimsConfidence: number;
  mainsAnswerWriting: number;
  sociologyConfidence: number;
  discipline: number;
  revision: number;
  testPractice: number;
}

export interface DiagnosisResult {
  segment: string;
  recommendation: string;
  riskLevel: RiskLevel;
  description: string;
}

export interface ResultData extends Step1Data, Step2Data, Step3Data {
  timestamp: string;
  segment: string;
  recommendation: string;
  riskLevel: RiskLevel;
  description: string;
}
