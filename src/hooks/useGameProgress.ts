import { useCallback, useEffect, useState } from 'react';
import type { DeletionCase } from '../types/bst.types';
import type { AchievementDefinition, GameProgressState } from '../types/game.types';
import { evaluateNewAchievements } from '../game/achievements';
import { XP_VALUES } from '../game/scoring';

const STORAGE_KEY = 'bst-quest-progress-v1';

const DEFAULT_PROGRESS: GameProgressState = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedChallengeIds: [],
  unlockedAchievementIds: [],
  completedDeletionCases: [],
  totalCorrectPredictions: 0,
  totalOperationsRun: 0,
};

function loadProgress(): GameProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<GameProgressState>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      completedChallengeIds: Array.isArray(parsed.completedChallengeIds)
        ? parsed.completedChallengeIds
        : [],
      unlockedAchievementIds: Array.isArray(parsed.unlockedAchievementIds)
        ? parsed.unlockedAchievementIds
        : [],
      completedDeletionCases: Array.isArray(parsed.completedDeletionCases)
        ? parsed.completedDeletionCases
        : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgressState>(() => loadProgress());
  const [recentAchievement, setRecentAchievement] = useState<AchievementDefinition | null>(
    null
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const applyWithAchievements = useCallback(
    (updater: (prev: GameProgressState) => GameProgressState) => {
      setProgress((prev) => {
        const next = updater(prev);
        const newlyUnlocked = evaluateNewAchievements(next);
        if (newlyUnlocked.length > 0) {
          const bonusXp = newlyUnlocked.reduce((sum, a) => sum + a.xpBonus, 0);
          setRecentAchievement(newlyUnlocked[0]);
          return {
            ...next,
            xp: next.xp + bonusXp,
            unlockedAchievementIds: [
              ...next.unlockedAchievementIds,
              ...newlyUnlocked.map((a) => a.id),
            ],
          };
        }
        return next;
      });
    },
    []
  );

  const recordOperation = useCallback(
    (deletionCase?: DeletionCase) => {
      applyWithAchievements((prev) => {
        const cases =
          deletionCase && !prev.completedDeletionCases.includes(deletionCase)
            ? [...prev.completedDeletionCases, deletionCase]
            : prev.completedDeletionCases;
        return {
          ...prev,
          totalOperationsRun: prev.totalOperationsRun + 1,
          completedDeletionCases: cases,
        };
      });
    },
    [applyWithAchievements]
  );

  const recordPrediction = useCallback(
    (correct: boolean) => {
      applyWithAchievements((prev) => {
        if (!correct) {
          return { ...prev, streak: 0 };
        }
        const nextStreak = prev.streak + 1;
        return {
          ...prev,
          xp: prev.xp + XP_VALUES.CORRECT_PREDICTION,
          streak: nextStreak,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          totalCorrectPredictions: prev.totalCorrectPredictions + 1,
        };
      });
    },
    [applyWithAchievements]
  );

  const completeChallenge = useCallback(
    (challengeId: string, earnedXp: number, deletionCase?: DeletionCase) => {
      applyWithAchievements((prev) => {
        const alreadyDone = prev.completedChallengeIds.includes(challengeId);
        const cases =
          deletionCase && !prev.completedDeletionCases.includes(deletionCase)
            ? [...prev.completedDeletionCases, deletionCase]
            : prev.completedDeletionCases;

        return {
          ...prev,
          xp: alreadyDone ? prev.xp + Math.round(earnedXp * 0.25) : prev.xp + earnedXp,
          completedChallengeIds: alreadyDone
            ? prev.completedChallengeIds
            : [...prev.completedChallengeIds, challengeId],
          completedDeletionCases: cases,
        };
      });
    },
    [applyWithAchievements]
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    setRecentAchievement(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const dismissAchievement = useCallback(() => {
    setRecentAchievement(null);
  }, []);

  return {
    progress,
    recentAchievement,
    dismissAchievement,
    recordOperation,
    recordPrediction,
    completeChallenge,
    resetProgress,
  };
}
