import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, X } from 'lucide-react';
import type {
  BSTNode,
  DeletionCase,
  OperationResult,
  OperationType,
  TraversalOrder,
} from './types/bst.types';
import type {
  ChallengeDefinition,
  GameModeId,
  ScoreBreakdown,
} from './types/game.types';
import {
  buildTreeFromValues,
  generateRandomValues,
} from './algorithms/bst';
import { insertWithSteps } from './algorithms/insertion';
import { searchWithSteps } from './algorithms/searching';
import { deleteWithSteps } from './algorithms/deletion';
import { traverseWithSteps } from './algorithms/traversal';
import { ALL_CHALLENGES, getLevelById, LEVELS } from './game/levels';
import { calculateChallengeScore } from './game/scoring';
import { usePlayback } from './hooks/usePlayback';
import { useGameProgress } from './hooks/useGameProgress';
import { Header } from './components/Header';
import { OperationPanel } from './components/OperationPanel';
import { TreeVisualizer } from './components/TreeVisualizer';
import { PlaybackControls } from './components/PlaybackControls';
import { StepTimeline } from './components/StepTimeline';
import { ExplanationPanel } from './components/ExplanationPanel';
import {
  ChallengeBar,
  type SearchPredictionAction,
} from './components/ChallengeBar';
import { ComplexityModal } from './components/ComplexityModal';
import { AchievementsModal } from './components/AchievementsModal';
import { HelpModal } from './components/HelpModal';

const INITIAL_PLAYGROUND_VALUES = [40, 20, 60, 10, 30];

export function App() {
  // Core mode & tree state
  const [mode, setMode] = useState<GameModeId>('playground');
  const [root, setRoot] = useState<BSTNode | null>(() =>
    buildTreeFromValues(INITIAL_PLAYGROUND_VALUES)
  );
  const [activeResult, setActiveResult] = useState<OperationResult | null>(null);

  // Control panel state
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('insert');
  const [traversalOrder, setTraversalOrder] = useState<TraversalOrder>('inorder');
  const [inputValue, setInputValue] = useState('');

  // Modals
  const [showComplexity, setShowComplexity] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Challenge state
  const [activeChallengeId, setActiveChallengeId] = useState<string>(
    LEVELS[0].challenges[0].id
  );
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [completionScore, setCompletionScore] = useState<ScoreBreakdown | null>(null);

  // Per-challenge mechanics state
  const [insertedSequenceCount, setInsertedSequenceCount] = useState(0);
  const [searchCursor, setSearchCursor] = useState<BSTNode | null>(null);
  const [predictedDeleteCase, setPredictedDeleteCase] = useState(false);
  const [traversalPredicted, setTraversalPredicted] = useState<number[]>([]);
  const [errorNodeValue, setErrorNodeValue] = useState<number | null>(null);

  // Progress & Playback hooks
  const {
    progress,
    recentAchievement,
    dismissAchievement,
    recordOperation,
    recordPrediction,
    completeChallenge,
    resetProgress,
  } = useGameProgress();

  const steps = useMemo(() => activeResult?.steps ?? [], [activeResult]);
  const playback = usePlayback(steps);

  const currentLevel = useMemo(
    () => (mode === 'playground' ? undefined : getLevelById(mode)),
    [mode]
  );

  const currentChallenge: ChallengeDefinition | undefined = useMemo(() => {
    if (!currentLevel) return undefined;
    return (
      currentLevel.challenges.find((c) => c.id === activeChallengeId) ??
      currentLevel.challenges[0]
    );
  }, [currentLevel, activeChallengeId]);

  const expectedTraversalSequence = useMemo(() => {
    if (
      currentChallenge?.kind !== 'traversal-predict' ||
      !currentChallenge.traversalOrder
    ) {
      return [];
    }
    return (
      traverseWithSteps(root, currentChallenge.traversalOrder).traversalSequence ?? []
    );
  }, [currentChallenge, root]);

  const loadChallenge = useCallback((challenge: ChallengeDefinition) => {
    const freshRoot = buildTreeFromValues(challenge.initialValues);
    setActiveChallengeId(challenge.id);
    setRoot(freshRoot);
    setActiveResult(null);
    setShowHint(false);
    setUsedHint(false);
    setMistakes(0);
    setCorrectPredictions(0);
    setFeedback(null);
    setCompletionScore(null);
    setInsertedSequenceCount(0);
    setSearchCursor(freshRoot);
    setPredictedDeleteCase(false);
    setTraversalPredicted([]);
    setErrorNodeValue(null);
    setInputValue(
      challenge.targetValue !== undefined ? String(challenge.targetValue) : ''
    );

    if (challenge.kind === 'build-sequence') {
      setSelectedOperation('insert');
    } else if (challenge.kind === 'search-predict') {
      setSelectedOperation('search');
    } else if (challenge.kind === 'delete-case') {
      setSelectedOperation('delete');
    } else if (challenge.kind === 'traversal-predict') {
      setSelectedOperation('traversal');
      if (challenge.traversalOrder) {
        setTraversalOrder(challenge.traversalOrder);
      }
    }
  }, []);

  const handleSelectMode = useCallback(
    (nextMode: GameModeId) => {
      setMode(nextMode);
      setActiveResult(null);
      setFeedback(null);
      setCompletionScore(null);

      if (nextMode === 'playground') {
        setRoot(buildTreeFromValues(INITIAL_PLAYGROUND_VALUES));
        setSelectedOperation('insert');
        setInputValue('');
        return;
      }

      const lvl = getLevelById(nextMode);
      if (lvl) {
        const firstIncomplete =
          lvl.challenges.find(
            (c) => !progress.completedChallengeIds.includes(c.id)
          ) ?? lvl.challenges[0];
        loadChallenge(firstIncomplete);
      }
    },
    [loadChallenge, progress.completedChallengeIds]
  );

  // Auto-play newly generated operation results (handled cleanly by usePlayback)
  const runOperationResult = useCallback(
    (result: OperationResult) => {
      setActiveResult(result);
      setRoot(result.finalRoot);
      recordOperation(result.success ? result.deletionCase : undefined);
    },
    [recordOperation]
  );

  const finalizeChallenge = useCallback(
    (
      challenge: ChallengeDefinition,
      extraCorrectPredictions = 0,
      deletionCase?: DeletionCase
    ) => {
      const score = calculateChallengeScore({
        baseXp: challenge.xpReward,
        correctPredictions: correctPredictions + extraCorrectPredictions,
        usedHint,
        mistakes,
      });
      setCompletionScore(score);
      completeChallenge(challenge.id, score.totalXp, deletionCase);
    },
    [completeChallenge, correctPredictions, mistakes, usedHint]
  );

  const handleExecuteOperation = useCallback(
    (op: OperationType, value?: number, order?: TraversalOrder) => {
      // Level 1 Build Sequence validation
      if (
        mode !== 'playground' &&
        currentChallenge?.kind === 'build-sequence' &&
        !completionScore
      ) {
        if (op !== 'insert' || value === undefined) return;
        const expectedVal = currentChallenge.targetSequence?.[insertedSequenceCount];
        if (expectedVal !== undefined && value !== expectedVal) {
          setMistakes((m) => m + 1);
          setFeedback({
            type: 'error',
            text: `Insert ${expectedVal} next to follow the target sequence (you entered ${value}).`,
          });
          return;
        }
        const res = insertWithSteps(root, value);
        runOperationResult(res);
        if (res.success) {
          const nextCount = insertedSequenceCount + 1;
          setInsertedSequenceCount(nextCount);
          setFeedback({
            type: 'success',
            text: `Inserted ${value}! Watch how it followed the BST property.`,
          });
          if (
            currentChallenge.targetSequence &&
            nextCount >= currentChallenge.targetSequence.length
          ) {
            finalizeChallenge(currentChallenge);
          }
        }
        return;
      }

      // Level 3 Delete Case execution
      if (
        mode !== 'playground' &&
        currentChallenge?.kind === 'delete-case' &&
        !completionScore
      ) {
        if (!predictedDeleteCase) {
          setFeedback({
            type: 'info',
            text: 'First identify which deletion case applies using the buttons above.',
          });
          return;
        }
        if (op !== 'delete' || value === undefined || value !== currentChallenge.targetValue) {
          setFeedback({
            type: 'error',
            text: `Delete node ${currentChallenge.targetValue} to complete this challenge.`,
          });
          return;
        }
        const res = deleteWithSteps(root, value);
        runOperationResult(res);
        if (res.success) {
          finalizeChallenge(currentChallenge, 0, res.deletionCase);
        }
        return;
      }

      // Standard Playground execution
      if (op === 'insert' && value !== undefined) {
        runOperationResult(insertWithSteps(root, value));
      } else if (op === 'search' && value !== undefined) {
        runOperationResult(searchWithSteps(root, value));
      } else if (op === 'delete' && value !== undefined) {
        runOperationResult(deleteWithSteps(root, value));
      } else if (op === 'traversal') {
        runOperationResult(traverseWithSteps(root, order ?? traversalOrder));
      }
    },
    [
      completionScore,
      currentChallenge,
      finalizeChallenge,
      insertedSequenceCount,
      mode,
      predictedDeleteCase,
      root,
      runOperationResult,
      traversalOrder,
    ]
  );

  // Level 2: Search Prediction handler
  const handlePredictSearch = useCallback(
    (action: SearchPredictionAction) => {
      if (
        !currentChallenge ||
        currentChallenge.kind !== 'search-predict' ||
        currentChallenge.targetValue === undefined ||
        !searchCursor ||
        completionScore
      ) {
        return;
      }

      const target = currentChallenge.targetValue;
      const curVal = searchCursor.value;

      let expectedAction: SearchPredictionAction;
      if (target === curVal) {
        expectedAction = 'found';
      } else if (target < curVal) {
        expectedAction = searchCursor.left ? 'left' : 'not-found';
      } else {
        expectedAction = searchCursor.right ? 'right' : 'not-found';
      }

      if (action !== expectedAction) {
        setMistakes((m) => m + 1);
        recordPrediction(false);
        const hintMsg =
          target === curVal
            ? `${target} == ${curVal}, so the value is found at this node!`
            : target < curVal
            ? searchCursor.left
              ? `${target} < ${curVal}, so the BST property sends us Left.`
              : `${target} < ${curVal}, and there is no left child—so ${target} is not in the tree.`
            : searchCursor.right
            ? `${target} > ${curVal}, so the BST property sends us Right.`
            : `${target} > ${curVal}, and there is no right child—so ${target} is not in the tree.`;
        setFeedback({ type: 'error', text: `Not quite. ${hintMsg}` });
        return;
      }

      // Correct prediction!
      recordPrediction(true);
      setCorrectPredictions((c) => c + 1);

      if (action === 'left' && searchCursor.left) {
        setSearchCursor(searchCursor.left);
        setFeedback({
          type: 'success',
          text: `Correct! ${target} < ${curVal}, moving left to ${searchCursor.left.value}. (+25 XP)`,
        });
      } else if (action === 'right' && searchCursor.right) {
        setSearchCursor(searchCursor.right);
        setFeedback({
          type: 'success',
          text: `Correct! ${target} > ${curVal}, moving right to ${searchCursor.right.value}. (+25 XP)`,
        });
      } else {
        // Terminal prediction ('found' or 'not-found')
        setSearchCursor(null);
        const res = searchWithSteps(root, target);
        runOperationResult(res);
        setFeedback({
          type: 'success',
          text:
            action === 'found'
              ? `Exact match! Found ${target} at node ${curVal}.`
              : `Correct! Reached a null child, proving ${target} is not in the tree.`,
        });
        finalizeChallenge(currentChallenge, 1);
      }
    },
    [
      completionScore,
      currentChallenge,
      finalizeChallenge,
      recordPrediction,
      root,
      runOperationResult,
      searchCursor,
    ]
  );

  // Level 3: Delete Case Prediction handler
  const handlePredictDeleteCase = useCallback(
    (chosenCase: DeletionCase) => {
      if (
        !currentChallenge ||
        currentChallenge.kind !== 'delete-case' ||
        !currentChallenge.expectedDeletionCase
      ) {
        return;
      }

      if (chosenCase !== currentChallenge.expectedDeletionCase) {
        setMistakes((m) => m + 1);
        recordPrediction(false);
        setFeedback({
          type: 'error',
          text: `Look closely at node ${currentChallenge.targetValue}'s children and try again.`,
        });
        return;
      }

      recordPrediction(true);
      setCorrectPredictions((c) => c + 1);
      setPredictedDeleteCase(true);
      setFeedback({
        type: 'success',
        text: `Correct! Now run the deletion visualization to observe how the BST updates. (+25 XP)`,
      });
    },
    [currentChallenge, recordPrediction]
  );

  // Level 4: Traversal Node Click handler (also lets Playground click pre-fill value)
  const handleNodeClick = useCallback(
    (value: number) => {
      if (mode === 'playground') {
        setInputValue(String(value));
        return;
      }

      if (
        currentChallenge?.kind !== 'traversal-predict' ||
        completionScore ||
        !currentChallenge.traversalOrder
      ) {
        return;
      }

      const nextExpected = expectedTraversalSequence[traversalPredicted.length];
      if (value !== nextExpected) {
        setMistakes((m) => m + 1);
        recordPrediction(false);
        setErrorNodeValue(value);
        window.setTimeout(() => setErrorNodeValue(null), 650);
        setFeedback({
          type: 'error',
          text: `Node ${value} isn't next in ${
            currentChallenge.traversalOrder === 'bfs'
              ? 'BFS'
              : currentChallenge.traversalOrder
          } order. Remember: ${
            currentChallenge.traversalOrder === 'inorder'
              ? 'Left → Root → Right'
              : currentChallenge.traversalOrder === 'preorder'
              ? 'Root → Left → Right'
              : currentChallenge.traversalOrder === 'postorder'
              ? 'Left → Right → Root'
              : 'Level by level, left to right'
          }.`,
        });
        return;
      }

      recordPrediction(true);
      setCorrectPredictions((c) => c + 1);
      const nextList = [...traversalPredicted, value];
      setTraversalPredicted(nextList);
      setFeedback({
        type: 'success',
        text: `Correct! Visited ${value} (#${nextList.length}). (+25 XP)`,
      });

      if (nextList.length === expectedTraversalSequence.length) {
        const res = traverseWithSteps(root, currentChallenge.traversalOrder);
        runOperationResult(res);
        finalizeChallenge(currentChallenge, 1);
      }
    },
    [
      completionScore,
      currentChallenge,
      expectedTraversalSequence,
      finalizeChallenge,
      mode,
      recordPrediction,
      root,
      runOperationResult,
      traversalPredicted,
    ]
  );

  // Next challenge helper
  const nextChallengeObj = useMemo(() => {
    if (!currentChallenge) return undefined;
    const idx = ALL_CHALLENGES.findIndex((c) => c.id === currentChallenge.id);
    return idx >= 0 && idx < ALL_CHALLENGES.length - 1
      ? ALL_CHALLENGES[idx + 1]
      : undefined;
  }, [currentChallenge]);

  const handleNextChallenge = useCallback(() => {
    if (!nextChallengeObj) return;
    setMode(nextChallengeObj.levelId);
    loadChallenge(nextChallengeObj);
  }, [loadChallenge, nextChallengeObj]);

  const handleReset = useCallback(() => {
    if (mode === 'playground') {
      setRoot(buildTreeFromValues(INITIAL_PLAYGROUND_VALUES));
      setActiveResult(null);
      setInputValue('');
    } else if (currentChallenge) {
      loadChallenge(currentChallenge);
    }
  }, [currentChallenge, loadChallenge, mode]);

  // Auto-dismiss achievement toast after 4.5s
  useEffect(() => {
    if (!recentAchievement) return;
    const timer = window.setTimeout(() => dismissAchievement(), 4500);
    return () => window.clearTimeout(timer);
  }, [recentAchievement, dismissAchievement]);

  // Keyboard shortcuts for playback stepping
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        playback.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playback.prev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playback]);

  // Operation label for ExplanationPanel
  const operationLabel = useMemo(() => {
    if (!activeResult) return undefined;
    if (activeResult.operation === 'insert') {
      return `Inserting ${activeResult.targetValue}`;
    }
    if (activeResult.operation === 'search') {
      return `Searching for ${activeResult.targetValue}`;
    }
    if (activeResult.operation === 'delete') {
      return `Deleting ${activeResult.targetValue}`;
    }
    if (activeResult.traversalOrder === 'bfs') {
      return 'Breadth-First Search (BFS)';
    }
    return `${(activeResult.traversalOrder ?? 'inorder').toUpperCase()} Traversal`;
  }, [activeResult]);

  const isTraversalChallengeActive =
    mode !== 'playground' &&
    currentChallenge?.kind === 'traversal-predict' &&
    !completionScore;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-white text-[#334155]">
      {/* A. Header */}
      <Header
        mode={mode}
        onSelectMode={handleSelectMode}
        progress={progress}
        onReset={handleReset}
        onOpenComplexity={() => setShowComplexity(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Content Area: Left Control Panel + Main Visualization & Bottom Playback */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 p-3.5 max-w-[1600px] w-full mx-auto">
        {/* B. Left Control Panel */}
        <OperationPanel
          root={root}
          selectedOperation={selectedOperation}
          onSelectOperation={setSelectedOperation}
          traversalOrder={traversalOrder}
          onSelectTraversalOrder={setTraversalOrder}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onExecute={handleExecuteOperation}
          onBuildSequence={(values) => {
            setRoot(buildTreeFromValues(values));
            setActiveResult(null);
          }}
          onGenerateRandom={() => {
            setRoot(buildTreeFromValues(generateRandomValues(7)));
            setActiveResult(null);
          }}
          onLoadPreset={(values) => {
            setRoot(buildTreeFromValues(values));
            setActiveResult(null);
          }}
          onClearTree={() => {
            setRoot(null);
            setActiveResult(null);
          }}
          lockedOperation={
            mode === 'playground' ? undefined : currentLevel?.primaryOperation
          }
          disabled={
            mode !== 'playground' &&
            (currentChallenge?.kind === 'search-predict' ||
              currentChallenge?.kind === 'traversal-predict') &&
            !completionScore
          }
        />

        {/* Right Column: Challenge Bar + C. Tree Visualization + D. Bottom Operation Panel */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
          {currentLevel && currentChallenge && (
            <ChallengeBar
              level={currentLevel}
              challenge={currentChallenge}
              completedChallengeIds={progress.completedChallengeIds}
              onSelectChallenge={(id) => {
                const target = currentLevel.challenges.find((c) => c.id === id);
                if (target) loadChallenge(target);
              }}
              onNextChallenge={handleNextChallenge}
              hasNextChallenge={Boolean(nextChallengeObj)}
              showHint={showHint}
              onToggleHint={() => {
                setShowHint((prev) => !prev);
                setUsedHint(true);
              }}
              feedback={feedback}
              completionScore={completionScore}
              insertedSequenceCount={insertedSequenceCount}
              onQuickInsertNext={(val) => handleExecuteOperation('insert', val)}
              currentSearchNodeValue={searchCursor?.value ?? null}
              onPredictSearch={handlePredictSearch}
              predictedDeleteCase={predictedDeleteCase}
              onPredictDeleteCase={handlePredictDeleteCase}
              onRunChallengeDelete={() => {
                if (currentChallenge.targetValue !== undefined) {
                  handleExecuteOperation('delete', currentChallenge.targetValue);
                }
              }}
              traversalPredicted={traversalPredicted}
              traversalTotal={expectedTraversalSequence.length}
            />
          )}

          {/* C. Main Visualization Area */}
          <TreeVisualizer
            root={root}
            step={playback.currentStep}
            allSteps={steps}
            challengeActiveNodeId={
              currentChallenge?.kind === 'search-predict' && !completionScore
                ? searchCursor?.id ?? null
                : null
            }
            challengeVisitedValues={
              isTraversalChallengeActive ? traversalPredicted : []
            }
            challengeErrorNodeValue={errorNodeValue}
            clickableNodes={mode === 'playground' || isTraversalChallengeActive}
            onNodeClick={handleNodeClick}
          />

          {/* D. Bottom Operation Panel */}
          <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-3 shrink-0">
            <PlaybackControls
              currentIndex={playback.currentIndex}
              totalSteps={playback.totalSteps}
              isPlaying={playback.isPlaying}
              speed={playback.speed}
              isAtStart={playback.isAtStart}
              isAtEnd={playback.isAtEnd}
              onPrev={playback.prev}
              onNext={playback.next}
              onTogglePlay={playback.togglePlay}
              onReplay={playback.replay}
              onSpeedChange={playback.setSpeed}
            />

            <StepTimeline
              steps={steps}
              currentIndex={playback.currentIndex}
              onSelectStep={playback.goToStep}
            />

            <ExplanationPanel
              step={playback.currentStep}
              operationLabel={operationLabel}
              currentIndex={playback.currentIndex}
              totalSteps={playback.totalSteps}
            />
          </section>
        </div>
      </main>

      {/* Achievement Toast */}
      {recentAchievement && (
        <div className="fixed top-16 right-4 z-40 max-w-xs rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">
              Achievement Unlocked · +{recentAchievement.xpBonus} XP
            </p>
            <p className="text-xs font-bold">{recentAchievement.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {recentAchievement.description}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissAchievement}
            className="text-slate-400 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Educational Modals */}
      <ComplexityModal
        open={showComplexity}
        onClose={() => setShowComplexity(false)}
      />
      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        progress={progress}
        onResetProgress={resetProgress}
      />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;
