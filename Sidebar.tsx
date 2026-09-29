import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  Bookmark,
  X,
  GraduationCap,
  Atom,
  Binary,
  Globe2,
  Dna,
  Calculator,
} from 'lucide-react';
import { NavTab } from '../../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  savedCount: number;
  onSelectSubjectPrompt?: (subject: string, sampleTopic: string, targetTab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  savedCount,
  onSelectSubjectPrompt,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'qa' as NavTab, label: 'Question & Answer', icon: HelpCircle },
    { id: 'explain' as NavTab, label: 'Deep Explain', icon: Lightbulb },
    { id: 'quiz' as NavTab, label: 'Practice Quiz', icon: CheckSquare },
    { id: 'summarize' as NavTab, label: 'Study Summarizer', icon: FileText },
    { id: 'recommendations' as NavTab, label: 'Learning Path', icon: Compass },
    { id: 'notebook' as NavTab, label: 'Study Notebook', icon: Bookmark, badge: savedCount },
  ];

  const subjects = [
    { name: 'Physics', icon: Atom, topic: 'Special Relativity and Time Dilation', tab: 'explain' as NavTab },
    { name: 'Mathematics', icon: Calculator, topic: 'Limits and Derivatives in Calculus', tab: 'explain' as NavTab },
    { name: 'Computer Sci', icon: Binary, topic: 'Binary Search Algorithm Efficiency', tab: 'qa' as NavTab },
    { name: 'Biology', icon: Dna, topic: 'CRISPR Cas9 Gene Editing Mechanics', tab: 'qa' as NavTab },
    { name: 'World History', icon: Globe2, topic: 'Industrial Revolution Global Impacts', tab: 'summarize' as NavTab },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const handleSubjectClick = (subject: string, topic: string, targetTab: NavTab) => {
    if (onSelectSubjectPrompt) {
      onSelectSubjectPrompt(subject, topic, targetTab);
    } else {
      onSelectTab(targetTab);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">EduGenie</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smart Student Companion</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Learning Tools
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Subject Starters */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Explore Subjects
            </div>
            <div className="space-y-1">
              {subjects.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSubjectClick(s.name, s.topic, s.tab)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-600 rounded-md hover:bg-slate-50 hover:text-indigo-700 transition-colors group text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-800">Learning Tip</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Use <strong className="text-slate-700">Deep Explain</strong> to build the mental model, then test your recall with <strong className="text-slate-700">Practice Quiz</strong>!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
