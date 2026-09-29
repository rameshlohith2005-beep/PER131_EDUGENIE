import {
  QAResult,
  ExplainResult,
  QuizData,
  SummarizeResult,
  LearningPathResult,
  EducationLevel,
  QuizDifficulty,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Server responded with status ${res.status}`);
  }
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Invalid response structure from educational assistant.');
  }
  return json.data as T;
}

export const apiService = {
  async askQuestion(question: string, level: EducationLevel = 'high_school', subject: string = 'General'): Promise<QAResult> {
    const res = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, level, subject }),
    });
    const data = await handleResponse<QAResult>(res);
    return { ...data, question, level, timestamp: Date.now() };
  },

  async explainConcept(topic: string, level: EducationLevel = 'high_school', focusArea: string = ''): Promise<ExplainResult> {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, focusArea }),
    });
    const data = await handleResponse<ExplainResult>(res);
    return { ...data, timestamp: Date.now() };
  },

  async generateQuiz(topic: string, difficulty: QuizDifficulty = 'intermediate'): Promise<QuizData> {
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty }),
    });
    const data = await handleResponse<QuizData>(res);
    return { ...data, timestamp: Date.now() };
  },

  async summarizeText(text: string, focus: string = 'comprehensive'): Promise<SummarizeResult> {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, focus }),
    });
    const data = await handleResponse<SummarizeResult>(res);
    return { ...data, originalText: text, timestamp: Date.now() };
  },

  async getLearningPath(topic: string, currentLevel: string = 'beginner', learningGoal: string = ''): Promise<LearningPathResult> {
    const res = await fetch('/api/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, currentLevel, learningGoal }),
    });
    const data = await handleResponse<LearningPathResult>(res);
    return { ...data, timestamp: Date.now() };
  },
};
