import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Brain, CheckCircle2 } from 'lucide-react';

interface LoadingCardProps {
  mode: 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations';
  customTitle?: string;
}

const loadingMessages = {
  qa: [
    'Analyzing student question...',
    'Consulting educational concepts...',
    'Formulating direct, student-friendly answer...',
    'Structuring real-world examples and study tips...',
  ],
  explain: [
    'Calibrating explanation to selected level...',
    'Distilling core principles without jargon...',
    'Crafting relatable analogies and breakdown points...',
    'Clarifying common misconceptions...',
  ],
  quiz: [
    'Targeting key knowledge checkpoints...',
    'Formulating 3 comprehensive questions...',
    'Synthesizing 4 plausible answer options per question...',
    'Writing educational answer justifications...',
  ],
  summarize: [
    'Scanning study material and structure...',
    'Extracting essential concepts and key arguments...',
    'Generating rapid-revision notes...',
    'Crafting self-check flashcard questions...',
  ],
  recommendations: [
    'Evaluating subject prerequisites...',
    'Structuring sequential learning milestones...',
    'Designing targeted practice activities...',
    'Optimizing spaced repetition retention review...',
  ],
};

export const LoadingCard: React.FC<LoadingCardProps> = ({ mode, customTitle }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = loadingMessages[mode] || loadingMessages.qa;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 animate-bounce">
        {mode === 'quiz' ? (
          <Brain className="w-7 h-7" />
        ) : mode === 'explain' ? (
          <BookOpen className="w-7 h-7" />
        ) : (
          <Sparkles className="w-7 h-7" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        {customTitle || 'EduGenie is thinking...'}
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Crafting personalized educational insights for your study session
      </p>

      {/* Progress tracker */}
      <div className="max-w-md mx-auto space-y-2.5 text-left">
        {steps.map((msg, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={msg}
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isCurrent
                  ? 'text-indigo-600 font-medium scale-[1.01]'
                  : isDone
                  ? 'text-slate-600'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
              )}
              <span>{msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
