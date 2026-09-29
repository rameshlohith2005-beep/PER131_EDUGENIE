import React from 'react';
import { Sparkles, Bookmark, Menu, Brain, BookOpen } from 'lucide-react';
import { NavTab } from '../../types';

interface HeaderProps {
  currentTab: NavTab;
  onOpenNotebook: () => void;
  savedCount: number;
  onToggleMobileNav: () => void;
  quizScoreAverage?: number;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Student Learning Hub',
    subtitle: 'Your personal AI mentor for mastering concepts, quizzes, and study paths',
  },
  qa: {
    title: 'AI Question & Answer',
    subtitle: 'Ask any question and receive structured, student-friendly explanations with examples',
  },
  explain: {
    title: 'AI Deep Explain',
    subtitle: 'Understand complex concepts broken down step-by-step at your exact learning level',
  },
  quiz: {
    title: 'AI Practice Quiz',
    subtitle: 'Test your understanding with exactly 3 targeted questions, explanations, and instant score',
  },
  summarize: {
    title: 'AI Study Summarizer',
    subtitle: 'Condense notes and chapters into high-yield summaries, key concepts, and revision flashcards',
  },
  recommendations: {
    title: 'Personalized Learning Path',
    subtitle: 'Discover what to learn first, core conceptual roadmaps, and practice milestones',
  },
  notebook: {
    title: 'Study Notebook & History',
    subtitle: 'Review your saved answers, explanations, quiz attempts, and roadmaps',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNotebook,
  savedCount,
  onToggleMobileNav,
}) => {
  const currentMeta = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">EduGenie</span>
            </div>

            <div className="hidden lg:block">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-slate-500 line-clamp-1">{currentMeta.subtitle}</p>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mr-2">
              <span className="inline-flex items-center gap-1 text-indigo-700 font-medium bg-indigo-50/80 px-2 py-0.5 rounded">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Tutor Active</span>
              </span>
            </div>

            {/* Notebook button */}
            <button
              type="button"
              onClick={onOpenNotebook}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-600" />
              <span>Saved Notes</span>
              {savedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
