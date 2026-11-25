import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Info,
  Lightbulb,
} from 'lucide-react';
import type { OperationStep } from '../types/bst.types';

interface ExplanationPanelProps {
  step: OperationStep | null;
  operationLabel?: string;
  currentIndex: number;
  totalSteps: number;
}

export function ExplanationPanel({
  step,
  operationLabel,
  currentIndex,
  totalSteps,
}: ExplanationPanelProps) {
  if (!step) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-xs text-slate-600">
          Run an <strong className="text-slate-800">Insert</strong>,{' '}
          <strong className="text-slate-800">Search</strong>,{' '}
          <strong className="text-slate-800">Delete</strong>, or{' '}
          <strong className="text-slate-800">Traversal</strong> operation to inspect every
          comparison and tree transformation step by step.
        </p>
      </div>
    );
  }

  const isSuccess =
    step.type === 'found' ||
    step.type === 'insert' ||
    step.type === 'complete' ||
    step.type === 'visit';
  const isError = step.type === 'error' || step.type === 'not-found';

  const badgeClass = isError
    ? 'bg-red-50 text-[#DC2626] border-red-200'
    : isSuccess
    ? 'bg-teal-50 text-[#0D9488] border-teal-200'
    : 'bg-amber-50 text-[#D97706] border-amber-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-lg bg-slate-50/90 border border-slate-200/90 p-3.5">
      {/* Main Step Description */}
      <div className="md:col-span-7 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {operationLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {operationLabel} · Step {currentIndex + 1} of {totalSteps}
            </span>
          )}
          {step.deletionCase && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-semibold uppercase tracking-wide">
              {step.deletionCase === 'leaf' && 'Case 1: Leaf'}
              {step.deletionCase === 'one-child' && 'Case 2: One Child'}
              {step.deletionCase === 'two-children' && 'Case 3: Two Children'}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border shrink-0 ${badgeClass}`}
          >
            {isError ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {step.title}
              {step.comparisonText && (
                <span className="ml-2 font-mono text-xs px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900">
                  {step.comparisonText}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>

      {/* Algorithmic Reasoning ("Why?") + Next Hint */}
      <div className="md:col-span-5 md:border-l md:border-slate-200 md:pl-3.5 flex flex-col justify-between gap-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#2563EB] mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Why?
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">{step.reasoning}</p>
          </div>
        </div>

        {step.nextHint && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563EB] bg-blue-50/70 border border-blue-100 rounded-md px-2.5 py-1">
            <ArrowRight className="w-3 h-3 shrink-0" />
            <span>Next: {step.nextHint}</span>
          </div>
        )}
      </div>
    </div>
  );
}
