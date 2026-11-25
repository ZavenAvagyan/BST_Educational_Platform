import {
  Award,
  BookOpen,
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  TreePine,
} from 'lucide-react';
import type { GameModeId, GameProgressState } from '../types/game.types';
import { ALL_CHALLENGES, LEVELS } from '../game/levels';

interface HeaderProps {
  mode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
  progress: GameProgressState;
  onReset: () => void;
  onOpenComplexity: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
}

export function Header({
  mode,
  onSelectMode,
  progress,
  onReset,
  onOpenComplexity,
  onOpenAchievements,
  onOpenHelp,
}: HeaderProps) {
  const completedCount = progress.completedChallengeIds.length;
  const totalChallenges = ALL_CHALLENGES.length;
  const progressPct = Math.round((completedCount / totalChallenges) * 100);

  return (
    <header className="w-full border-b border-slate-200 bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
          <TreePine className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
            BST Quest
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight">
            Binary Search Tree Learning Game
          </p>
        </div>
      </div>

      {/* Mode / Level Switcher */}
      <nav
        aria-label="Game Modes"
        className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => onSelectMode('playground')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            mode === 'playground'
              ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Playground
        </button>
        {LEVELS.map((lvl) => {
          const doneInLevel = lvl.challenges.filter((c) =>
            progress.completedChallengeIds.includes(c.id)
          ).length;
          const allDone = doneInLevel === lvl.challenges.length;
          const active = mode === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectMode(lvl.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                active
                  ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>L{lvl.number}: {lvl.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  allDone
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {doneInLevel}/{lvl.challenges.length}
              </span>
            </button>
          );
        })}
      </nav>

      {/* XP, Streak, Progress & Utility Controls */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono">{progress.xp} XP</span>
          </div>
          <span className="w-px h-3.5 bg-slate-200" />
          <div
            className="flex items-center gap-1 text-xs font-semibold text-amber-600"
            title="Current prediction streak"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="font-mono">{progress.streak}</span>
          </div>
          <span className="w-px h-3.5 bg-slate-200" />
          <div className="flex items-center gap-1.5" title="Quest completion">
            <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              {completedCount}/{totalChallenges}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenComplexity}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Big-O Time Complexity"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Complexity</span>
        </button>

        <button
          type="button"
          onClick={onOpenAchievements}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Achievements"
        >
          <Award className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">
            {progress.unlockedAchievementIds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Reset current tree / challenge"
          aria-label="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="How BST Quest works"
          aria-label="Help"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
