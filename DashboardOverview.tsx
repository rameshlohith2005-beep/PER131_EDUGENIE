import React, { useState } from 'react';
import {
  HelpCircle,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  Bookmark,
  Award,
  Atom,
  Calculator,
  Binary,
  Dna,
  Globe2,
  Clock,
} from 'lucide-react';
import { NavTab, SavedItem } from '../../types';

interface DashboardOverviewProps {
  onSelectTab: (tab: NavTab, initialTopic?: string) => void;
  savedItems: SavedItem[];
  onOpenNotebook: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectTab,
  savedItems,
  onOpenNotebook,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    onSelectTab('qa', quickQuery.trim());
  };

  const featureCards = [
    {
      tab: 'qa' as NavTab,
      title: 'AI Question & Answer',
      tagline: 'Student-Friendly Explanations',
      desc: 'Ask homework or conceptual questions. Receive direct answers, detailed step-by-step breakdowns, and intuitive real-world examples.',
      icon: HelpCircle,
      accent: 'indigo',
      badge: 'Step-by-Step',
    },
    {
      tab: 'explain' as NavTab,
      title: 'AI Deep Explain',
      tagline: 'Calibrated to Your Grade Level',
      desc: 'Choose your level from "Explain Like I\'m 5" to College. Starts with simple intuition, then delivers rigorous breakdowns and common misconceptions.',
      icon: Lightbulb,
      accent: 'amber',
      badge: 'ELI5 to College',
    },
    {
      tab: 'quiz' as NavTab,
      title: 'AI Practice Quiz',
      tagline: 'Exactly 3 Questions · 4 Options',
      desc: 'Test your understanding on any subject. Answers stay sealed until submission, followed by instant score calculation and educational rationale.',
      icon: CheckSquare,
      accent: 'emerald',
      badge: 'Interactive',
    },
    {
      tab: 'summarize' as NavTab,
      title: 'AI Study Summarizer',
      tagline: 'Revision & Flash-Cram Ready',
      desc: 'Paste lecture notes, study guides, or textbook excerpts to extract concise summaries, highlighted vocabulary, and interactive self-check checkpoints.',
      icon: FileText,
      accent: 'sky',
      badge: 'High Yield',
    },
    {
      tab: 'recommendations' as NavTab,
      title: 'Learning Path',
      tagline: 'What to Learn First & Next',
      desc: 'Generates logical learning roadmaps showing prerequisite foundations, starting milestones, sequential concepts, practice tasks, and revision schedules.',
      icon: Compass,
      accent: 'violet',
      badge: 'Roadmaps',
    },
  ];

  const quickSubjects = [
    { name: 'Physics: Thermodynamics', tab: 'explain' as NavTab, topic: 'The Laws of Thermodynamics and Entropy' },
    { name: 'Calculus: Derivatives', tab: 'explain' as NavTab, topic: 'Derivatives and Rates of Change' },
    { name: 'Biology: Cellular Respiration', tab: 'quiz' as NavTab, topic: 'Cellular Respiration and ATP' },
    { name: 'Computer Sci: Sorting Algorithms', tab: 'qa' as NavTab, topic: 'How does QuickSort work compared to MergeSort?' },
    { name: 'History: French Revolution', tab: 'summarize' as NavTab, topic: 'The French Revolution causes and reign of terror' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Educational Mentor for Students</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
            What would you like to learn or master today?
          </h2>

          <p className="text-sm text-indigo-100/90 leading-relaxed">
            EduGenie turns complex textbooks into clear explanations, instant quizzes, concise revision notes, and guided roadmaps.
          </p>

          {/* Quick Ask Searchbar */}
          <form onSubmit={handleQuickSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Ask any question, concept, or topic (e.g. How does photosynthesis work?)..."
                  className="w-full pl-4 pr-4 py-3 text-sm bg-white text-slate-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!quickQuery.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Ask EduGenie</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Quick Launch Subject Chips */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Study Starters
          </span>
          <span className="text-xs text-slate-400">Click to launch immediately</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickSubjects.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => onSelectTab(s.tab, s.topic)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs group"
            >
              <span>{s.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* 5 Core Feature Cards Grid */}
      <div>
        <div className="mb-4 px-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Study Modes & AI Tools
          </h3>
          <p className="text-xs text-slate-500">Choose a focused educational tool below</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.tab}
                onClick={() => onSelectTab(feat.tab)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {feat.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {feat.title}
                  </h4>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    {feat.tagline}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open {feat.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}

          {/* Notebook Quick Card */}
          <div
            onClick={onOpenNotebook}
            className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  {savedItems.length} Notes
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                Saved Study Notebook
              </h4>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Your Personal Knowledge Vault
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review, export, and search through saved answers, deep explanations, quiz scores, and personalized learning roadmaps.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>View Saved Notes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Saved Notes & Quick Stats */}
      {savedItems.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Saved Study Notes
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenNotebook}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all ({savedItems.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {savedItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={onOpenNotebook}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-colors"
              >
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {item.type.toUpperCase()}
                </span>
                <div className="text-xs font-bold text-slate-900 truncate mb-0.5">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
