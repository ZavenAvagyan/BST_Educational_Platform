import type { OperationStep } from '../types/bst.types';

interface StepTimelineProps {
  steps: OperationStep[];
  currentIndex: number;
  onSelectStep: (index: number) => void;
}

export function StepTimeline({
  steps,
  currentIndex,
  onSelectStep,
}: StepTimelineProps) {
  if (steps.length <= 1) return null;

  return (
    <div className="space-y-1.5">
      {/* Range slider for fast scrubbing */}
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        value={currentIndex}
        onChange={(e) => onSelectStep(Number(e.target.value))}
        aria-label="Step timeline slider"
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
      />

      {/* Clickable step dots for direct step skipping */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          return (
            <button
              key={`${step.type}-${idx}`}
              type="button"
              onClick={() => onSelectStep(idx)}
              title={`Step ${idx + 1}: ${step.title}`}
              className={`group flex-1 min-w-[20px] flex flex-col items-center gap-1 py-0.5 rounded transition-colors ${
                isCurrent ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  isCurrent
                    ? 'bg-[#2563EB] border-[#2563EB] scale-125'
                    : isPast
                    ? 'bg-blue-200 border-[#2563EB]/60'
                    : 'bg-white border-slate-300 group-hover:border-slate-400'
                }`}
              />
              <span
                className={`text-[10px] font-mono leading-none ${
                  isCurrent ? 'font-bold text-[#2563EB]' : 'text-slate-400'
                }`}
              >
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
