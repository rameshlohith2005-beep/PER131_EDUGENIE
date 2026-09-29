export type NavTab = 'dashboard' | 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations' | 'notebook';

export type EducationLevel = 'eli5' | 'elementary' | 'middle_school' | 'high_school' | 'college';
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

// 1. Q&A Types
export interface QAResult {
  directAnswer: string;
  detailedExplanation: string;
  realWorldExample: string;
  keyTakeaway: string;
  relatedConcepts: string[];
  studyTip: string;
  timestamp?: number;
  question?: string;
  level?: string;
}

// 2. Explain Types
export interface BreakdownPoint {
  title: string;
  detail: string;
}

export interface ExamplePoint {
  context: string;
  explanation: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
}

export interface MisconceptionItem {
  myth: string;
  fact: string;
}

export interface ExplainResult {
  topic: string;
  levelLabel: string;
  simpleExplanation: string;
  detailedExplanation: string;
  breakdownPoints: BreakdownPoint[];
  examples: ExamplePoint[];
  keyVocabulary: VocabularyItem[];
  commonMisconceptions: MisconceptionItem[];
  timestamp?: number;
}

// 3. Quiz Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  timestamp?: number;
}

export interface QuizSubmission {
  quiz: QuizData;
  userAnswers: (number | null)[];
  score: number;
  submittedAt: number;
}

// 4. Summarizer Types
export interface ImportantConcept {
  concept: string;
  definition: string;
  whyItMatters: string;
}

export interface SelfCheckQuestion {
  question: string;
  answer: string;
}

export interface SummarizeResult {
  title: string;
  readingTime: string;
  conciseSummary: string;
  keyPoints: string[];
  importantConcepts: ImportantConcept[];
  quickRevisionNotes: string[];
  selfCheckQuestions: SelfCheckQuestion[];
  originalText?: string;
  timestamp?: number;
}

// 5. Learning Path Types
export interface WhatToLearnFirst {
  title: string;
  description: string;
  keyObjectives: string[];
  starterResourcesOrTips: string;
}

export interface NextConceptStep {
  step: number;
  title: string;
  description: string;
  milestone: string;
  subTopics: string[];
}

export interface PracticeActivity {
  title: string;
  activityType: string;
  description: string;
  expectedOutcome: string;
}

export interface RevisionTopic {
  topic: string;
  retentionCheck: string;
  cadence: string;
}

export interface LearningPathResult {
  topic: string;
  overview: string;
  estimatedTotalTime: string;
  prerequisites: string[];
  whatToLearnFirst: WhatToLearnFirst;
  nextConcepts: NextConceptStep[];
  practiceActivities: PracticeActivity[];
  revisionTopics: RevisionTopic[];
  timestamp?: number;
}

// Saved Study Notebook Item
export interface SavedItem {
  id: string;
  type: 'qa' | 'explain' | 'quiz' | 'summary' | 'path';
  title: string;
  subtitle: string;
  content: any;
  createdAt: number;
}
