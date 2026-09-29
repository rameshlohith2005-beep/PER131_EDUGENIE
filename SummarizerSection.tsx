import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  CheckCircle2,
  Key,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { SummarizeResult, NavTab } from '../../types';
import { LoadingCard } from '../common/LoadingCard';
import { SpeechButton } from '../common/SpeechButton';

interface SummarizerSectionProps {
  onNavigateToTab: (tab: NavTab, initialTopic?: string) => void;
  onSavedNoteChange?: () => void;
}

const sampleMaterials = [
  {
    title: 'Photosynthesis & Chloroplasts',
    text: `Photosynthesis is the biological process used by plants, algae, and certain bacteria to convert light energy into chemical energy stored in glucose. The process occurs inside chloroplasts, specialized organelles containing the green pigment chlorophyll. The overall equation is 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. 
Photosynthesis consists of two distinct stages: light-dependent reactions and light-independent reactions (the Calvin Cycle). In the light reactions, thylakoid membranes absorb photons, splitting water molecules (photolysis) to generate ATP, NADPH, and release oxygen gas as a byproduct. In the Calvin Cycle, occurring in the stroma, the enzyme RuBisCO fixes atmospheric carbon dioxide into 3-PGA, which is subsequently converted into G3P and sugars using the chemical energy stored in ATP and NADPH. Factors that limit the rate of photosynthesis include light intensity, ambient carbon dioxide concentration, and ambient temperature.`,
  },
  {
    title: 'Newton\'s Three Laws of Motion',
    text: `Sir Isaac Newton formulated three physical laws that established classical mechanics. The First Law (Law of Inertia) states that an object at rest will remain at rest, and an object in uniform motion will remain in motion along a straight line unless acted upon by a net external force. Inertia is quantified by mass. 
The Second Law states that the acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass, expressed mathematically as F = ma (Force equals mass times acceleration). This defines how momentum changes over time under an applied net force. 
The Third Law states that whenever one object exerts a force on a second object, the second object exerts an equal and opposite force on the first (For every action, there is an equal and opposite reaction). These forces always act on two different bodies and therefore never cancel each other out on a single object.`,
  },
  {
    title: 'The Industrial Revolution',
    text: `The Industrial Revolution began in Britain during the mid-18th century, transitioning agrarian societies into mechanized, industrial urban economies. Central to this transformation was the development of the commercial steam engine by James Watt, fueled by abundant coal deposits. The textile industry was revolutionised by inventions like the spinning jenny, water frame, and power loom, shifting production from cottage industries into centralized factories. 
Railroads and steamships radically reduced transportation costs and connected global markets. However, the period also resulted in severe socio-economic challenges: rapid unplanned urbanization led to squalid living conditions, child labor in dangerous factories, and long work hours without safety regulations. In response, labor unions emerged, and legislative reforms gradually improved worker protections, fundamentally reshaping the global social fabric.`,
  },
];

export const SummarizerSection: React.FC<SummarizerSectionProps> = ({
  onNavigateToTab,
  onSavedNoteChange,
}) => {
  const [text, setText] = useState('');
  const [focus, setFocus] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || wordCount < 5) return;

    setLoading(true);
    setError(null);
    setRevealedAnswers({});
    setSaved(false);

    try {
      const data = await apiService.summarizeText(text.trim(), focus);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to summarize study material.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySummary = () => {
    if (!result) return;
    const formatted = `TITLE: ${result.title}\n\nSUMMARY:\n${result.conciseSummary}\n\nKEY POINTS:\n${result.keyPoints.map((p) => `• ${p}`).join('\n')}\n\nIMPORTANT CONCEPTS:\n${result.importantConcepts.map((c) => `- ${c.concept}: ${c.definition} (Why it matters: ${c.whyItMatters})`).join('\n')}\n\nQUICK REVISION:\n${result.quickRevisionNotes.map((r) => `* ${r}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    storageService.saveItem({
      type: 'summary',
      title: result.title || 'Study Summary',
      subtitle: `${result.readingTime} · ${result.keyPoints.length} key points`,
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
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Study Summarizer</h2>
            <p className="text-xs text-slate-500">
              Paste your lecture notes, textbook chapters, or articles to extract key takeaways, vocabulary, and exam revision flashcards.
            </p>
          </div>
        </div>

        <form onSubmit={handleSummarize} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="study-text" className="block text-xs font-semibold text-slate-700">
                Paste Study Material / Notes
              </label>
              <div className="text-[11px] text-slate-400">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </div>
            </div>
            <textarea
              id="study-text"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste notes, paragraphs, or chapter excerpts here..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y placeholder:text-slate-400 leading-relaxed font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Summary Focus:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                {[
                  { id: 'comprehensive', label: 'Balanced' },
                  { id: 'exam_prep', label: 'Exam Cram' },
                  { id: 'concept_drill', label: 'Vocab & Concepts' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocus(f.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      focus === f.id
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {text.trim() && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={loading || wordCount < 5}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Synthesizing...' : 'Generate Study Summary'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Sample material buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Or test with sample study notes:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleMaterials.map((sample) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => setText(sample.text)}
                className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-700 px-3 py-1.5 rounded-md transition-colors border border-slate-200/60"
              >
                {sample.title}
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
      {loading && <LoadingCard mode="summarize" customTitle="Condensing & Highlighting Study Material" />}

      {/* Result Display */}
      {result && !loading && (
        <div className="space-y-5">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{result.title}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{result.readingTime}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SpeechButton text={result.conciseSummary} label="Listen Summary" />
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
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

          {/* 1. Concise Summary Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-1">
                Executive Summary
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {result.conciseSummary}
              </p>
            </div>

            {/* 2. Key Points */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Key Takeaways
              </div>
              <ul className="space-y-2">
                {result.keyPoints?.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Important Concepts Cards */}
          {result.importantConcepts && result.importantConcepts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Highlighted Concepts & Definitions
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.importantConcepts.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-slate-900 block">
                      {item.concept}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.definition}
                    </p>
                    <div className="pt-1 text-[11px] text-indigo-900 font-medium bg-indigo-50/60 p-1.5 rounded">
                      <strong className="text-indigo-950 font-semibold">Why it matters:</strong>{' '}
                      {item.whyItMatters}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Quick Revision Flash Notes */}
          {result.quickRevisionNotes && result.quickRevisionNotes.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Rapid-Fire Revision Facts (Exam Cram)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
                {result.quickRevisionNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-md bg-white/80 border border-amber-200/60">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Self-Check Interactive Questions */}
          {result.selfCheckQuestions && result.selfCheckQuestions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Self-Check Comprehension Checkpoints
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Test yourself before moving on. Try answering in your head, then reveal the answer.
              </p>

              <div className="space-y-2.5">
                {result.selfCheckQuestions.map((sc, idx) => {
                  const isOpen = revealedAnswers[idx];
                  return (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-slate-800">
                          {idx + 1}. {sc.question}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAnswer(idx)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                        >
                          {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isOpen ? 'Hide' : 'Reveal'}</span>
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-slate-700 bg-white p-2.5 rounded border">
                          <strong className="text-emerald-700 font-semibold mr-1">Answer:</strong>
                          {sc.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompt to take quiz */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Want to test how much you retained?</div>
              <div className="text-xs text-slate-500">Take an instant 3-question quiz on this topic</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('quiz', result.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>Take Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
