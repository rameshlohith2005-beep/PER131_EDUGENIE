import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Download,
  Copy,
  Check,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  FileText,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { SavedItem, NavTab } from '../../types';
import { storageService } from '../../services/storage';

interface NotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onRefresh: () => void;
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
}

export const NotebookDrawer: React.FC<NotebookDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRefresh,
  onNavigateToTab,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = savedItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteSavedItem(id);
    onRefresh();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved study notes?')) {
      storageService.clearSavedItems();
      onRefresh();
    }
  };

  const handleCopyItem = (item: SavedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let text = `${item.title}\n${item.subtitle}\n\n`;
    if (item.type === 'qa') {
      text += `Direct Answer: ${item.content.directAnswer}\n\nExplanation:\n${item.content.detailedExplanation}\n\nExample:\n${item.content.realWorldExample}`;
    } else if (item.type === 'explain') {
      text += `Simple:\n${item.content.simpleExplanation}\n\nDetailed:\n${item.content.detailedExplanation}`;
    } else if (item.type === 'summary') {
      text += `Summary:\n${item.content.conciseSummary}\n\nKey Points:\n${item.content.keyPoints?.join('\n')}`;
    } else if (item.type === 'quiz') {
      text += `Topic: ${item.content.quiz?.topic}\nScore: ${item.content.score}/3`;
    } else if (item.type === 'path') {
      text += `Topic: ${item.content.topic}\nFirst: ${item.content.whatToLearnFirst?.title}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    if (savedItems.length === 0) return;
    let exportText = `# EduGenie Student Study Notes\nExported: ${new Date().toLocaleDateString()}\n\n`;
    savedItems.forEach((item, idx) => {
      exportText += `## ${idx + 1}. [${item.type.toUpperCase()}] ${item.title}\n`;
      exportText += `*${item.subtitle}* — ${new Date(item.createdAt).toLocaleDateString()}\n\n`;
      if (item.type === 'qa') {
        exportText += `**Answer:** ${item.content.directAnswer}\n\n**Detailed:** ${item.content.detailedExplanation}\n\n`;
      } else if (item.type === 'explain') {
        exportText += `**Intuition:** ${item.content.simpleExplanation}\n\n**Detailed:** ${item.content.detailedExplanation}\n\n`;
      } else if (item.type === 'summary') {
        exportText += `**Summary:** ${item.content.conciseSummary}\n\n`;
      } else if (item.type === 'quiz') {
        exportText += `**Score:** ${item.content.score}/3\n\n`;
      } else if (item.type === 'path') {
        exportText += `**Overview:** ${item.content.overview}\n\n`;
      }
      exportText += `---\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduGenie-Study-Notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qa':
        return HelpCircle;
      case 'explain':
        return Lightbulb;
      case 'quiz':
        return CheckSquare;
      case 'summary':
        return FileText;
      case 'path':
        return Compass;
      default:
        return Bookmark;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Saved Study Notebook</h3>
                <p className="text-[11px] text-slate-500">{savedItems.length} items saved locally</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {savedItems.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleExportAll}
                    title="Export all notes to Markdown"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    title="Clear all saved items"
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'qa', label: 'Q&A' },
              { id: 'explain', label: 'Explain' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'summary', label: 'Summaries' },
              { id: 'path', label: 'Roadmaps' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex-shrink-0 ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notebook is Empty
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Click the "Save" bookmark button on any Q&A answer, deep explanation, quiz score, or summary to access them anytime.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {item.type.toUpperCase()} · {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleCopyItem(item, e)}
                          title="Copy content"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete note"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick launcher to inspect in dedicated tab */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Ready to study</span>
                      <button
                        type="button"
                        onClick={() => {
                          const targetTab: NavTab =
                            item.type === 'qa'
                              ? 'qa'
                              : item.type === 'explain'
                              ? 'explain'
                              : item.type === 'quiz'
                              ? 'quiz'
                              : item.type === 'summary'
                              ? 'summarize'
                              : 'recommendations';
                          onNavigateToTab(targetTab, item.title);
                          onClose();
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        <span>Open Tool</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
