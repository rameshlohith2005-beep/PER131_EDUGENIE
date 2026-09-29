import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Copy,
  Check,
  Bookmark,
  ArrowRight,
  Lightbulb,
  GraduationCap,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { QAResult, EducationLevel, NavTab } from '../../types';
import { LoadingCard } from '../common/LoadingCard';
import { SpeechButton } from '../common/SpeechButton';

interface QuestionAnswerSectionProps {
  initialQuestion?: string;
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
  onSavedNoteChange?: () => void;
}

const sampleQuestions = [
  { q: 'Why does ice float on liquid water instead of sinking?', subject: 'Physics/Chemistry' },
  { q: 'How does mRNA tell ribosomes to synthesize specific proteins?', subject: 'Biology' },
  { q: 'Why is it mathematically impossible to divide any number by zero?', subject: 'Mathematics' },
  { q: 'What caused the fall of the Western Roman Empire?', subject: 'World History' },
  { q: 'How do quantum computers differ fundamentally from binary computers?', subject: 'Computer Science' },
];

export const QuestionAnswerSection: React.FC<QuestionAnswerSectionProps> = ({
  initialQuestion = '',
  onNavigateToTab,
  onSavedNoteChange,
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [level, setLevel] = useState<EducationLevel>('high_school');
  const [subject, setSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const data = await apiService.askQuestion(question.trim(), level, subject);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Question: ${question}\n\nAnswer: ${result.directAnswer}\n\nDetailed Explanation:\n${result.detailedExplanation}\n\nExample:\n${result.realWorldExample}\n\nKey Takeaway: ${result.keyTakeaway}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'qa',
      title: question,
      subtitle: `${level.replace('_', ' ')} · ${subject}`,
      content: result,
    });
    setSaved(true);
    if (onSavedNoteChange) onSavedNoteChange();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Student Q&A</h2>
            <p className="text-xs text-slate-500">
              Ask anything you are studying. Receive accurate answers tailored to your level with real examples.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="student-question" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Question
            </label>
            <textarea
              id="student-question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does photosynthesis convert sunlight into chemical energy? Why do tides occur?"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Level and Subject Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Learning Level:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                {(['middle_school', 'high_school', 'college'] as EducationLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      level === lvl
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl === 'middle_school' ? 'Middle School' : lvl === 'high_school' ? 'High School' : 'College'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Asking EduGenie...' : 'Ask Question'}</span>
            </button>
          </div>
        </form>

        {/* Sample prompt shortcuts */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Try a sample question:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((s) => (
              <button
                key={s.q}
                type="button"
                onClick={() => {
                  setQuestion(s.q);
                  setSubject(s.subject);
                }}
                className="text-left text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-md transition-colors border border-slate-200/60"
              >
                {s.q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold mb-0.5">Could not generate answer</p>
            <p className="text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingCard mode="qa" customTitle="Formulating Educational Answer" />}

      {/* Result Display */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Answer generated</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{level.replace('_', ' ')} level</span>
            </div>
            <div className="flex items-center gap-2">
              <SpeechButton text={`${result.directAnswer}. ${result.detailedExplanation}`} label="Listen" />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                  saved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{saved ? 'Saved in Notes' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Direct Answer Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Direct Answer
              </div>
              <p className="text-base font-semibold text-slate-900 leading-relaxed">
                {result.directAnswer}
              </p>
            </div>

            {/* Detailed Explanation */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Explanation
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {result.detailedExplanation}
              </p>
            </div>

            {/* Real World Example Card */}
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-semibold text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Real-World Example & Analogy</span>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed">
                {result.realWorldExample}
              </p>
            </div>

            {/* Key Takeaway */}
            <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1 text-indigo-900 font-semibold text-xs">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Key Revision Takeaway</span>
              </div>
              <p className="text-xs text-indigo-950 font-medium">
                {result.keyTakeaway}
              </p>
            </div>

            {/* Study Tip */}
            {result.studyTip && (
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-start gap-2">
                <span className="font-semibold text-slate-700">Memory Tip:</span>
                <span>{result.studyTip}</span>
              </div>
            )}
          </div>

          {/* Related Concepts & Next Steps */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Explore Related Concepts
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.relatedConcepts?.map((concept) => (
                <button
                  key={concept}
                  type="button"
                  onClick={() => {
                    setQuestion(`Can you explain ${concept}?`);
                    handleSubmit();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs font-medium"
                >
                  <span>{concept}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Jump to Quiz or Deep Explain button */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => onNavigateToTab('quiz', question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test your recall with a 3-Question Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('explain', question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Deep Explain this concept</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
