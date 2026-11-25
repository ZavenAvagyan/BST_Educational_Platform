import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { PlaybackSpeed } from '../hooks/usePlayback';

interface PlaybackControlsProps {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  isAtStart: boolean;
  isAtEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls({
  currentIndex,
  totalSteps,
  isPlaying,
  speed,
  isAtStart,
  isAtEnd,
  onPrev,
  onNext,
  onTogglePlay,
  onReplay,
  onSpeedChange,
}: PlaybackControlsProps) {
  const disabled = totalSteps === 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left: Step Counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Step
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs font-semibold text-slate-800">
          {totalSteps === 0 ? '0 / 0' : `${currentIndex + 1} / ${totalSteps}`}
        </span>
      </div>

      {/* Center: Transport Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onReplay}
          disabled={disabled}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors"
          title="Replay from start"
          aria-label="Replay"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || isAtStart}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled || totalSteps <= 1}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors min-w-[82px] justify-center"
          aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              {isAtEnd ? 'Replay' : 'Play'}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled || isAtEnd}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          aria-label="Next step"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Speed Selector */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              speed === s
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
