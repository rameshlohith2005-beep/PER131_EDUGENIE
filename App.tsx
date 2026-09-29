/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, SavedItem } from './types';
import { storageService } from './services/storage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { QuestionAnswerSection } from './components/qa/QuestionAnswerSection';
import { ExplainSection } from './components/explain/ExplainSection';
import { QuizSection } from './components/quiz/QuizSection';
import { SummarizerSection } from './components/summarizer/SummarizerSection';
import { LearningPathSection } from './components/recommendations/LearningPathSection';
import { NotebookDrawer } from './components/notebook/NotebookDrawer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [targetTopic, setTargetTopic] = useState<string>('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Load saved items on mount
  useEffect(() => {
    refreshSavedItems();
  }, []);

  const refreshSavedItems = () => {
    setSavedItems(storageService.getSavedItems());
  };

  const handleSelectTab = (tab: NavTab, initialTopic?: string) => {
    if (tab === 'notebook') {
      setNotebookOpen(true);
      return;
    }
    if (initialTopic) {
      setTargetTopic(initialTopic);
    } else {
      setTargetTopic('');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubjectPrompt = (subject: string, topic: string, targetTab: NavTab) => {
    setTargetTopic(topic);
    setCurrentTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        savedCount={savedItems.length}
        onSelectSubjectPrompt={handleSubjectPrompt}
      />

      {/* Main Content Area (offset by 64 Tailwind width for sidebar on large screens) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Sticky Header */}
        <Header
          currentTab={currentTab}
          onOpenNotebook={() => setNotebookOpen(true)}
          savedCount={savedItems.length}
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onSelectTab={handleSelectTab}
              savedItems={savedItems}
              onOpenNotebook={() => setNotebookOpen(true)}
            />
          )}

          {currentTab === 'qa' && (
            <QuestionAnswerSection
              key={targetTopic || 'qa-fresh'}
              initialQuestion={targetTopic}
              onNavigateToTab={handleSelectTab}
              onSavedNoteChange={refreshSavedItems}
            />
          )}

          {currentTab === 'explain' && (
            <ExplainSection
              key={targetTopic || 'explain-fresh'}
              initialTopic={targetTopic}
              onNavigateToTab={handleSelectTab}
              onSavedNoteChange={refreshSavedItems}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizSection
              key={targetTopic || 'quiz-fresh'}
              initialTopic={targetTopic}
              onNavigateToTab={handleSelectTab}
              onSavedNoteChange={refreshSavedItems}
            />
          )}

          {currentTab === 'summarize' && (
            <SummarizerSection
              key={targetTopic || 'summarize-fresh'}
              onNavigateToTab={handleSelectTab}
              onSavedNoteChange={refreshSavedItems}
            />
          )}

          {currentTab === 'recommendations' && (
            <LearningPathSection
              key={targetTopic || 'path-fresh'}
              initialTopic={targetTopic}
              onNavigateToTab={handleSelectTab}
              onSavedNoteChange={refreshSavedItems}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/60 py-6 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">EduGenie</span>
              <span>·</span>
              <span>AI-Powered Educational Study Assistant</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Factual Accuracy First</span>
              <span>·</span>
              <span>Conceptual Depth</span>
              <span>·</span>
              <span>Spaced Retention</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Saved Study Notebook Side Drawer */}
      <NotebookDrawer
        isOpen={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        savedItems={savedItems}
        onRefresh={refreshSavedItems}
        onNavigateToTab={handleSelectTab}
      />
    </div>
  );
}
