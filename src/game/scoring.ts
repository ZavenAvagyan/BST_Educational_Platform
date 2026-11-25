import type { ScoreBreakdown } from '../types/game.types';

export const XP_VALUES = {
  CORRECT_OPERATION: 100,
  CORRECT_PREDICTION: 25,
  NO_HINT_BONUS: 50,
  EFFICIENCY_BONUS: 50,
} as const;

export function calculateChallengeScore(params: {
  baseXp?: number;
  correctPredictions: number;
  usedHint: boolean;
  mistakes: number;
}): ScoreBreakdown {
  const baseXp = params.baseXp ?? XP_VALUES.CORRECT_OPERATION;
  const predictionXp = params.correctPredictions * XP_VALUES.CORRECT_PREDICTION;
  const noHintBonus = params.usedHint ? 0 : XP_VALUES.NO_HINT_BONUS;
  const efficiencyBonus = params.mistakes === 0 ? XP_VALUES.EFFICIENCY_BONUS : 0;
  const totalXp = baseXp + predictionXp + noHintBonus + efficiencyBonus;

  let stars: 1 | 2 | 3 = 1;
  if (params.mistakes === 0 && !params.usedHint) {
    stars = 3;
  } else if (params.mistakes <= 1) {
    stars = 2;
  }

  return {
    baseXp,
    predictionXp,
    noHintBonus,
    efficiencyBonus,
    totalXp,
    stars,
  };
}
