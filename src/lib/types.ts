export type GradeLevel = 
  | 'elementary'
  | 'middle_school'
  | 'high_school'
  | 'undergraduate'
  | 'graduate_research';

export type StudySubject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Engineering'
  | 'Literature'
  | 'History'
  | 'Philosophy'
  | 'Economics'
  | 'General Science';

export type ExplanationStyle = 
  | 'eli5'
  | 'conversational'
  | 'structured_academic'
  | 'rigorous_proof';

export interface StepBreakdown {
  stepNumber: number;
  title: string;
  explanation: string;
  mathFormula?: string;
  sanityCheck?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface StudyProblem {
  id: string;
  userId: string;
  title: string;
  question: string;
  subject: StudySubject | string;
  gradeLevel: GradeLevel;
  simplifiedExplanation: string;
  rigorousSolution: string;
  steps: StepBreakdown[];
  formulasUsed: string[];
  keyTakeaways: string[];
  practiceQuestions?: QuizQuestion[];
  status: 'solved' | 'bookmarked' | 'mastered';
  createdAt: string;
  updatedAt: string;
}

export interface ConceptNote {
  id: string;
  userId: string;
  title: string;
  domain: string;
  gradeLevel: GradeLevel;
  simpleAnalogy: string;
  deepDive: string;
  keyFormulas?: string[];
  tags: string[];
  masteryLevel: 'learning' | 'practicing' | 'mastered';
  quiz?: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  gradeLevel: GradeLevel;
  preferredTone: ExplanationStyle;
  favoriteSubjects: string[];
  createdAt?: string;
  updatedAt?: string;
}
