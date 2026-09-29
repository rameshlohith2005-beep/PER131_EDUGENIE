import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  Flag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  BookOpen,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { LearningPathResult, NavTab } from '../../types';
import { LoadingCard } from '../common/LoadingCard';

interface LearningPathSectionProps {
  initialTopic?: string;
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
  onSavedNoteChange?: () => void;
}

const samplePaths = [
  'Calculus I (Limits, Derivatives & Integrals)',
  'Modern Web Development with React',
  'Introduction to Machine Learning & Data Science',
  'Organic Chemistry Fundamentals',
  'Macroeconomics & Monetary Policy',
];

export const LearningPathSection: React.FC<LearningPathSectionProps> = ({
  initialTopic = '',
  onNavigateToTab,
  onSavedNoteChange,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGeneratePath = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setCompletedSteps({});
    setSaved(false);

    try {
      const data = await apiService.getLearningPath(topic.trim(), currentLevel, learningGoal.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate learning roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const handleCopy = () => {
    if (!result) return;
    const formatted = `LEARNING PATH: ${result.topic}\nEstimated Duration: ${result.estimatedTotalTime}\n\nOverview:\n${result.overview}\n\nWHAT TO LEARN FIRST:\n${result.whatToLearnFirst.title}: ${result.whatToLearnFirst.description}\n\nNEXT CONCEPTS:\n${result.nextConcepts.map((c) => `Step ${c.step}: ${c.title} - ${c.description}`).join('\n')}\n\nPRACTICE ACTIVITIES:\n${result.practiceActivities.map((a) => `• [${a.activityType}] ${a.title}: ${a.description}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'path',
      title: `Roadmap: ${result.topic}`,
      subtitle: `${result.estimatedTotalTime} · ${result.nextConcepts.length + 1} milestones`,
      content: result,
    });
    setSaved(true);
    if (onSavedNoteChange) onSavedNoteChange();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personalized Learning Roadmap</h2>
            <p className="text-xs text-slate-500">
              Map out what to learn first, the sequential concepts to follow, practical exercises, and revision checkpoints.
            </p>
          </div>
        </div>

        <form onSubmit={handleGeneratePath} className="mt-4 space-y-4">
          <div>
            <label htmlFor="path-topic" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject or Skill You Want to Master
            </label>
            <input
              id="path-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Linear Algebra, World War I, Python Programming, Human Genetics"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Current Experience
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              >
                <option value="complete_beginner">Complete Beginner (No prior knowledge)</option>
                <option value="beginner">Beginner (Basic awareness)</option>
                <option value="intermediate">Intermediate (Know the fundamentals)</option>
                <option value="advanced">Advanced (Looking for mastery/synthesis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Goal (Optional)
              </label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Ace the upcoming AP exam, build a project"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Mapping Path...' : 'Generate Learning Path'}</span>
            </button>
          </div>
        </form>

        {/* Sample Topics */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Popular Learning Paths:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePaths.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTopic(p)}
                className="text-xs bg-slate-100 hover:bg-violet-50 hover:text-violet-800 text-slate-700 px-3 py-1.5 rounded-md transition-colors border border-slate-200/60"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingCard mode="recommendations" customTitle={`Architecting Learning Path for "${topic}"`} />}

      {/* Result Display */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{result.topic}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <Clock className="w-3 h-3" />
                <span>{result.estimatedTotalTime}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Path'}</span>
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

          {/* Overview & Prerequisites Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600 mb-1">
                Roadmap Overview
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {result.overview}
              </p>
            </div>

            {/* Prerequisites */}
            {result.prerequisites && result.prerequisites.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Foundational Prerequisites
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.prerequisites.map((req, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      <span>{req}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 1. WHAT TO LEARN FIRST (Step 0 / Kickoff) */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  What To Learn First (Initial Milestone)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('explain', result.whatToLearnFirst.title)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold inline-flex items-center gap-1"
              >
                <span>Explain this first</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {result.whatToLearnFirst.title}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {result.whatToLearnFirst.description}
            </p>

            {/* Objectives */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-indigo-950 uppercase tracking-wider block mb-1.5">
                Key Focus Objectives:
              </span>
              <ul className="space-y-1">
                {result.whatToLearnFirst.keyObjectives?.map((obj, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-indigo-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.whatToLearnFirst.starterResourcesOrTips && (
              <div className="p-2.5 rounded-md bg-white/80 border border-indigo-100 text-xs text-indigo-950">
                <strong>Study Tip:</strong> {result.whatToLearnFirst.starterResourcesOrTips}
              </div>
            )}
          </div>

          {/* 2. NEXT CONCEPTS (Timeline / Milestones) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Next Sequential Milestones
              </h4>
            </div>

            <div className="space-y-4">
              {result.nextConcepts?.map((stepItem) => {
                const isChecked = completedSteps[stepItem.step];
                return (
                  <div
                    key={stepItem.step}
                    className={`p-4 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStepCompleted(stepItem.step)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Toggle completed"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                              Milestone {stepItem.step}
                            </span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs font-bold text-slate-900">{stepItem.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {stepItem.description}
                          </p>

                          {/* Sub topics */}
                          {stepItem.subTopics && stepItem.subTopics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {stepItem.subTopics.map((sub, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => onNavigateToTab('explain', sub)}
                                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                                >
                                  {sub}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <Flag className="w-3 h-3 text-slate-400" />
                          <span>{stepItem.milestone}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SUGGESTED PRACTICE ACTIVITIES */}
          {result.practiceActivities && result.practiceActivities.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recommended Practice Activities
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.practiceActivities.map((act, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {act.activityType}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block pt-1">{act.title}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                    <div className="pt-1 text-[11px] text-slate-500">
                      <strong>Expected Outcome:</strong> {act.expectedOutcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. REVISION TOPICS & RETENTION SCHEDULE */}
          {result.revisionTopics && result.revisionTopics.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Spaced Repetition & Revision Schedule
                </h4>
              </div>

              <div className="space-y-2.5">
                {result.revisionTopics.map((rev, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3 text-xs bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-900 block">{rev.topic}</span>
                      <p className="text-slate-600 text-xs mt-0.5">{rev.retentionCheck}</p>
                    </div>
                    <span className="flex-shrink-0 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                      {rev.cadence}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
