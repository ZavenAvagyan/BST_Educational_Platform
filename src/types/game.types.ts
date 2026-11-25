import type { DeletionCase, OperationType, TraversalOrder } from './bst.types';

export type GameModeId = 'playground' | 'level-1' | 'level-2' | 'level-3' | 'level-4';

export type ChallengeKind =
  | 'build-sequence'
  | 'search-predict'
  | 'delete-case'
  | 'traversal-predict';

export interface ChallengeDefinition {
  id: string;
  levelId: Exclude<GameModeId, 'playground'>;
  index: number;
  title: string;
  prompt: string;
  kind: ChallengeKind;
  initialValues: number[];
  /** Level 1: sequence of values the player must insert */
  targetSequence?: number[];
  /** Level 2 & 3: target value to search or delete */
  targetValue?: number;
  /** Level 2: whether targetValue exists in initialValues */
  shouldExist?: boolean;
  /** Level 3: expected deletion case */
  expectedDeletionCase?: DeletionCase;
  /** Level 4: traversal order to predict */
  traversalOrder?: TraversalOrder;
  hint: string;
  xpReward: number;
}

export interface LevelDefinition {
  id: Exclude<GameModeId, 'playground'>;
  number: 1 | 2 | 3 | 4;
  name: string;
  subtitle: string;
  description: string;
  primaryOperation: OperationType;
  challenges: ChallengeDefinition[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface ScoreBreakdown {
  baseXp: number;
  predictionXp: number;
  noHintBonus: number;
  efficiencyBonus: number;
  totalXp: number;
  stars: 1 | 2 | 3;
}

export interface GameProgressState {
  xp: number;
  streak: number;
  bestStreak: number;
  completedChallengeIds: string[];
  unlockedAchievementIds: string[];
  completedDeletionCases: DeletionCase[];
  totalCorrectPredictions: number;
  totalOperationsRun: number;
}
