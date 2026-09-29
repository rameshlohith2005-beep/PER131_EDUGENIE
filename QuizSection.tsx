import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Bookmark,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { QuizData, QuizDifficulty, NavTab } from '../../types';
import { LoadingCard } from '../common/LoadingCard';

interface QuizSectionProps {
  initialTopic?: string;
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
  onSavedNoteChange?: () => void;
}

const sampleQuizTopics = [
  'Newton\'s Three Laws of Motion',
  'Cellular Respiration and Mitochondria',
  'World War II Pacific Theater',
  'Python Data Structures (Lists, Dicts, Sets)',
  'Photosynthesis Light Reactions',
  'Plate Tectonics and Earthquakes',
];

export const QuizSection: React.FC<QuizSectionProps> = ({
  initialTopic = '',
  onNavigateToTab,
  onSavedNoteChange,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([null, null, null]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);

  const handleGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedAnswers([null, null, null]);
    setCurrentQuestionIndex(0);
    setSavedResult(false);

    try {
      const data = await apiService.generateQuiz(topic.trim(), difficulty);
      // Guarantee exactly 3 questions
      setQuizData({
        ...data,
        questions: data.questions.slice(0, 3),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return; // Answer locked after submission
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIdx] = optionIdx;
      return next;
    });
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    return quizData.questions.reduce((score, q, idx) => {
      return score + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    setIsSubmitted(true);
    const score = calculateScore();

    // Record submission in storage history
    storageService.saveQuizSubmission({
      quiz: quizData,
      userAnswers: selectedAnswers,
      score,
      submittedAt: Date.now(),
    });
  };

  const handleSaveResult = () => {
    if (!quizData) return;
    const score = calculateScore();
    storageService.saveItem({
      type: 'quiz',
      title: `Quiz: ${quizData.topic}`,
      subtitle: `Score: ${score}/3 (${Math.round((score / 3) * 100)}%) · ${quizData.difficulty}`,
      content: {
        quiz: quizData,
        selectedAnswers,
        score,
      },
    });
    setSavedResult(true);
    if (onSavedNoteChange) onSavedNoteChange();
    setTimeout(() => setSavedResult(false), 2500);
  };

  const handleRetakeQuiz = () => {
    setIsSubmitted(false);
    setSelectedAnswers([null, null, null]);
    setCurrentQuestionIndex(0);
  };

  const answeredCount = selectedAnswers.filter((a) => a !== null).length;
  const score = isSubmitted ? calculateScore() : 0;
  const percentage = Math.round((score / 3) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Generator Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Practice Quiz</h2>
            <p className="text-xs text-slate-500">
              Generates exactly 3 multiple-choice questions with 4 options each. Answers are sealed until submission.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateQuiz} className="mt-4 space-y-4">
          <div>
            <label htmlFor="quiz-topic" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject or Topic to Test
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's Laws, Photosynthesis, French Revolution, Binary Trees"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                {(['beginner', 'intermediate', 'advanced'] as QuizDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                      difficulty === diff
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Quiz...' : 'Generate 3-Question Quiz'}</span>
            </button>
          </div>
        </form>

        {/* Sample Topics */}
        {!quizData && !loading && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Or pick a ready-to-test topic:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuizTopics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1.5 rounded-md transition-colors border border-slate-200/60"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingCard mode="quiz" customTitle={`Generating 3-Question Quiz on "${topic}"`} />}

      {/* ACTIVE QUIZ (NOT SUBMITTED YET) */}
      {quizData && !isSubmitted && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Quiz Header & Step Indicators */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{quizData.topic}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 capitalize">{quizData.difficulty}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Question {currentQuestionIndex + 1} of 3
              </p>
            </div>

            {/* Step buttons */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = selectedAnswers[idx] !== null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-200'
                        : isAnswered
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          <div className="p-6">
            {quizData.questions[currentQuestionIndex] && (
              <div className="space-y-5">
                <h3 className="text-base font-semibold text-slate-900 leading-relaxed">
                  <span className="text-indigo-600 mr-2">Q{currentQuestionIndex + 1}.</span>
                  {quizData.questions[currentQuestionIndex].question}
                </h3>

                {/* Exactly 4 Options */}
                <div className="space-y-2.5">
                  {quizData.questions[currentQuestionIndex].options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm font-medium leading-relaxed pt-0.5">
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation & Submit Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {answeredCount} of 3 answered
              </span>

              {currentQuestionIndex < 2 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RESULT SCREEN (AFTER SUBMISSION) */}
      {quizData && isSubmitted && (
        <div className="space-y-6">
          {/* Result Score Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xs ${
                    score === 3
                      ? 'bg-emerald-100 text-emerald-700'
                      : score === 2
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Quiz Completed
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {score} / 3 Correct ({percentage}%)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {score === 3
                      ? 'Outstanding! You have mastered this concept!'
                      : score === 2
                      ? 'Great job! You demonstrated solid understanding.'
                      : 'Good effort! Review the explanations below to reinforce your knowledge.'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetakeQuiz}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveResult}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    savedResult
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedResult ? 'Result Saved' : 'Save Result'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToTab('explain', quizData.topic)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study with Deep Explain</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Detailed Answer & Explanation Review
            </h4>

            {quizData.questions.map((q, idx) => {
              const studentAnswer = selectedAnswers[idx];
              const isCorrect = studentAnswer === q.correctIndex;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-6 shadow-2xs space-y-4 ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4">
                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                      <span className="text-slate-400 mr-2">Question {idx + 1}:</span>
                      {q.question}
                    </h5>
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Options with status styling */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isStudentChoice = studentAnswer === optIdx;
                      const isCorrectChoice = q.correctIndex === optIdx;

                      let style = 'bg-slate-50 border-slate-200 text-slate-600';
                      if (isCorrectChoice) {
                        style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                      } else if (isStudentChoice && !isCorrect) {
                        style = 'bg-rose-50 border-rose-300 text-rose-950 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${style}`}
                        >
                          <span className="font-bold uppercase text-[11px] mt-0.5">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectChoice && (
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational Explanation */}
                  <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs">
                    <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Why this is correct:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
