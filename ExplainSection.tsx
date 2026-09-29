import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Bookmark,
  Layers,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  BookMarked,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { ExplainResult, EducationLevel, NavTab } from '../../types';
import { LoadingCard } from '../common/LoadingCard';
import { SpeechButton } from '../common/SpeechButton';

interface ExplainSectionProps {
  initialTopic?: string;
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
  onSavedNoteChange?: () => void;
}

const levelLabels: { id: EducationLevel; label: string; desc: string }[] = [
  { id: 'eli5', label: "Explain Like I'm 5", desc: 'Playful metaphors, zero jargon' },
  { id: 'elementary', label: 'Elementary', desc: 'Grades 1-5 fundamentals' },
  { id: 'middle_school', label: 'Middle School', desc: 'Grades 6-8 structured intuition' },
  { id: 'high_school', label: 'High School', desc: 'Grades 9-12 core curriculum' },
  { id: 'college', label: 'College / Advanced', desc: 'Undergraduate depth & mechanisms' },
];

const sampleTopics = [
  'Quantum Superposition',
  'Supply and Demand Elasticity',
  'Tectonic Plate Subduction',
  'Neural Networks & Backpropagation',
  'The Krebs Cycle',
  'Game Theory & Nash Equilibrium',
];

export const ExplainSection: React.FC<ExplainSectionProps> = ({
  initialTopic = '',
  onNavigateToTab,
  onSavedNoteChange,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState<EducationLevel>('high_school');
  const [focusArea, setFocusArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const data = await apiService.explainConcept(topic.trim(), level, focusArea.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to explain concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Topic: ${result.topic} (${result.levelLabel})\n\nSimple Explanation:\n${result.simpleExplanation}\n\nDetailed Explanation:\n${result.detailedExplanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'explain',
      title: result.topic,
      subtitle: `${result.levelLabel}`,
      content: result,
    });
    setSaved(true);
    if (onSavedNoteChange) onSavedNoteChange();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search and Config Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Deep Explain</h2>
            <p className="text-xs text-slate-500">
              Master any concept from first principles. Starts with a simple intuitive summary, then delves into rich details and examples.
            </p>
          </div>
        </div>

        <form onSubmit={handleExplain} className="mt-4 space-y-4">
          <div>
            <label htmlFor="explain-topic" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Concept or Topic to Understand
            </label>
            <input
              id="explain-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Entropy in Thermodynamics, Osmosis, Electoral College, Dijkstra's Algorithm"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Level Selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Select Target Learning Level:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {levelLabels.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevel(item.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    level === item.id
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex-1 max-w-xs mr-3">
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Optional focus (e.g. practical use, history)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Explaining...' : 'Explain Concept'}</span>
            </button>
          </div>
        </form>

        {/* Sample Topics */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Or try these popular topics:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 px-3 py-1 rounded-md transition-colors border border-slate-200/60"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <p className="font-semibold mb-0.5">Explanation error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingCard mode="explain" customTitle={`Explaining "${topic}" at ${level.replace('_', ' ')} level`} />}

      {/* Result Display */}
      {result && !loading && (
        <div className="space-y-5">
          {/* Header Action bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{result.topic}</span>
              <span aria-hidden="true">·</span>
              <span>{result.levelLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <SpeechButton text={`${result.simpleExplanation}. ${result.detailedExplanation}`} label="Listen" />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* 1. SIMPLE EXPLANATION FIRST */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Simple Explanation (The Intuition)</span>
            </div>
            <p className="text-base font-medium text-amber-950 leading-relaxed">
              {result.simpleExplanation}
            </p>
          </div>

          {/* 2. DETAILED EXPLANATION */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Detailed Conceptual Breakdown</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {result.detailedExplanation}
              </p>
            </div>

            {/* Breakdown Points Grid */}
            {result.breakdownPoints && result.breakdownPoints.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Key Principles & Mechanisms</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.breakdownPoints.map((pt, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-900 mb-1">
                        {idx + 1}. {pt.title}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{pt.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real World Examples */}
            {result.examples && result.examples.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Real-World Scenarios & Analogies</span>
                </h4>
                <div className="space-y-2.5">
                  {result.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100/80">
                      <span className="text-xs font-bold text-indigo-900 block mb-0.5">
                        {ex.context}
                      </span>
                      <p className="text-xs text-indigo-950/80 leading-relaxed">{ex.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Vocabulary Terms */}
            {result.keyVocabulary && result.keyVocabulary.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-slate-500" />
                  <span>Key Academic Vocabulary</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.keyVocabulary.map((v, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-xs font-bold text-slate-900 block mb-0.5">{v.term}</span>
                      <p className="text-xs text-slate-500 leading-snug">{v.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Misconceptions */}
            {result.commonMisconceptions && result.commonMisconceptions.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Common Misconceptions vs Actual Reality</span>
                </h4>
                <div className="space-y-2">
                  {result.commonMisconceptions.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-50/60 border border-rose-200/70 text-xs">
                      <div className="font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1 py-0.5 rounded">
                          Myth
                        </span>
                        <span>{item.myth}</span>
                      </div>
                      <div className="text-slate-700 pl-4 border-l-2 border-rose-300">
                        <strong className="text-slate-900">Reality:</strong> {item.fact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Quiz on this topic */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Ready to test what you just learned?</div>
              <div className="text-xs text-slate-500">Take a 3-question quiz on {result.topic}</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('quiz', result.topic)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Take Practice Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
