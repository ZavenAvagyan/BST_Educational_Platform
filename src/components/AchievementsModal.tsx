import { Award, CheckCircle2, Lock, RotateCcw, X } from 'lucide-react';
import { ACHIEVEMENTS } from '../game/achievements';
import type { GameProgressState } from '../types/game.types';

interface AchievementsModalProps {
  open: boolean;
  onClose: () => void;
  progress: GameProgressState;
  onResetProgress: () => void;
}

export function AchievementsModal({
  open,
  onClose,
  progress,
  onResetProgress,
}: AchievementsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-5 space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Achievements & Stats</h2>
              <p className="text-xs text-slate-500">
                {progress.xp} XP · Best Streak: {progress.bestStreak} ·{' '}
                {progress.unlockedAchievementIds.length}/{ACHIEVEMENTS.length} unlocked
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = progress.unlockedAchievementIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                  unlocked
                    ? 'bg-teal-50/60 border-teal-200'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      unlocked
                        ? 'bg-[#0D9488] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {unlocked ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{ach.title}</h3>
                    <p className="text-[11px] text-slate-600">{ach.description}</p>
                  </div>
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    unlocked
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  +{ach.xpBonus} XP
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Progress is saved automatically in your browser.
          </span>
          <button
            type="button"
            onClick={() => {
              onResetProgress();
              onClose();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
