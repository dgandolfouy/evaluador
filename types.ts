export interface Criterion {
  id: string;
  name: string;
  description: string;
  score: number;
  feedback?: string;
  category: string;
}

export type Department = string;

export interface Role {
  jobTitle: string;
  department: Department;
  reportsTo?: string;
}

export interface Employee {
  id: string;
  name: string;
  department: Department;
  jobTitle: string;
  additionalRoles?: Role[];
  reportsTo?: string; // ID of the manager
  averageScore?: number;
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  trainingPlan: string[];
  isoComplianceLevel: string;
}

export interface SavedEvaluation {
  id: string;
  date: string; // ISO string
  employeeId: string;
  evaluatorId: string;
  criteria: Criterion[];
  analysis: AnalysisResult;
}

export interface EvaluationState {
  step: 'dashboard' | 'organigram' | 'evaluating' | 'report' | 'admin' | 'stats' | 'form';
  selectedEmployeeId: string | null;
  currentCriteria: Criterion[];
  analysis: AnalysisResult | null;
  viewingEvaluatorId?: string;
}

export interface AdminSettings {
  categories: string[];
  defaultCriteria: Omit<Criterion, 'score' | 'feedback'>[];
}
