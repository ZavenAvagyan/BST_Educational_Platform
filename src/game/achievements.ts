import type { AchievementDefinition, GameProgressState } from '../types/game.types';
import { ALL_CHALLENGES, LEVELS } from './levels';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-operation',
    title: 'First Root',
    description: 'Run your first visualized BST operation.',
    icon: 'Sprout',
    xpBonus: 25,
  },
  {
    id: 'tree-architect',
    title: 'Tree Architect',
    description: 'Complete all Level 1 — Build the Tree challenges.',
    icon: 'Network',
    xpBonus: 75,
  },
  {
    id: 'pathfinder',
    title: 'Pathfinder',
    description: 'Complete all Level 2 — Find the Value challenges.',
    icon: 'Compass',
    xpBonus: 75,
  },
  {
    id: 'deletion-master',
    title: 'Deletion Master',
    description: 'Successfully perform all 3 deletion cases (leaf, one child, two children).',
    icon: 'Scissors',
    xpBonus: 100,
  },
  {
    id: 'traversal-sage',
    title: 'Traversal Sage',
    description: 'Complete all Level 4 — Traversal challenges (Inorder, Preorder, Postorder).',
    icon: 'Route',
    xpBonus: 100,
  },
  {
    id: 'streak-5',
    title: 'Sharp Intuition',
    description: 'Reach a streak of 5 consecutive correct predictions.',
    icon: 'Flame',
    xpBonus: 50,
  },
  {
    id: 'bst-grandmaster',
    title: 'BST Grandmaster',
    description: 'Complete every challenge across all 4 levels of BST Quest.',
    icon: 'Trophy',
    xpBonus: 150,
  },
];

export function evaluateNewAchievements(state: GameProgressState): AchievementDefinition[] {
  const unlocked = new Set(state.unlockedAchievementIds);
  const completed = new Set(state.completedChallengeIds);
  const newlyUnlocked: AchievementDefinition[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) newlyUnlocked.push(def);
    }
  };

  check('first-operation', state.totalOperationsRun >= 1);

  const l1Ids = LEVELS[0].challenges.map((c) => c.id);
  check('tree-architect', l1Ids.every((id) => completed.has(id)));

  const l2Ids = LEVELS[1].challenges.map((c) => c.id);
  check('pathfinder', l2Ids.every((id) => completed.has(id)));

  check(
    'deletion-master',
    state.completedDeletionCases.includes('leaf') &&
      state.completedDeletionCases.includes('one-child') &&
      state.completedDeletionCases.includes('two-children')
  );

  const l4Ids = LEVELS[3].challenges.map((c) => c.id);
  check('traversal-sage', l4Ids.every((id) => completed.has(id)));

  check('streak-5', state.bestStreak >= 5);

  check(
    'bst-grandmaster',
    ALL_CHALLENGES.every((c) => completed.has(c.id))
  );

  return newlyUnlocked;
}
