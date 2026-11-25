import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Star,
  Target,
  XCircle,
} from 'lucide-react';
import type { DeletionCase } from '../types/bst.types';
import type {
  ChallengeDefinition,
  LevelDefinition,
  ScoreBreakdown,
} from '../types/game.types';

export type SearchPredictionAction = 'left' | 'right' | 'found' | 'not-found';

interface ChallengeBarProps {
  level: LevelDefinition;
  challenge: ChallengeDefinition;
  completedChallengeIds: string[];
  onSelectChallenge: (challengeId: string) => void;
  onNextChallenge: () => void;
  hasNextChallenge: boolean;

  // Shared challenge state
  showHint: boolean;
  onToggleHint: () => void;
  feedback: { type: 'success' | 'error' | 'info'; text: string } | null;
  completionScore: ScoreBreakdown | null;

  // Level 1: Build sequence
  insertedSequenceCount: number;
  onQuickInsertNext?: (val: number) => void;

  // Level 2: Search prediction
  currentSearchNodeValue: number | null;
  onPredictSearch?: (action: SearchPredictionAction) => void;

  // Level 3: Delete case prediction
  predictedDeleteCase: boolean;
  onPredictDeleteCase?: (c: DeletionCase) => void;
  onRunChallengeDelete?: () => void;

  // Level 4: Traversal prediction
  traversalPredicted: number[];
  traversalTotal: number;
}

export function ChallengeBar({
  level,
  challenge,
  completedChallengeIds,
  onSelectChallenge,
  onNextChallenge,
  hasNextChallenge,
  showHint,
  onToggleHint,
  feedback,
  completionScore,
  insertedSequenceCount,
  onQuickInsertNext,
  currentSearchNodeValue,
  onPredictSearch,
  predictedDeleteCase,
  onPredictDeleteCase,
  onRunChallengeDelete,
  traversalPredicted,
  traversalTotal,
}: ChallengeBarProps) {
  const nextBuildVal =
    challenge.kind === 'build-sequence' && challenge.targetSequence
      ? challenge.targetSequence[insertedSequenceCount]
      : undefined;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5">
      {/* Top row: Level + Challenge Tabs + Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-semibold">
            Level {level.number}: {level.name}
          </span>
          <div className="flex items-center gap-1">
            {level.challenges.map((c) => {
              const isCurrent = c.id === challenge.id;
              const isDone = completedChallengeIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectChallenge(c.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                    isCurrent
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : isDone
                      ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isDone && !isCurrent && <CheckCircle2 className="w-3 h-3" />}
                  <span>#{c.index}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleHint}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            showHint
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showHint ? 'Hide Hint' : 'Hint'}
        </button>
      </div>

      {/* Prompt */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {challenge.title}
            </h2>
            <p className="text-xs text-slate-600">{challenge.prompt}</p>
          </div>
        </div>

        {/* Interactive Challenge Controls */}
        {!completionScore && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Level 1: Sequence Queue */}
            {challenge.kind === 'build-sequence' && challenge.targetSequence && (
              <div className="flex flex-wrap items-center gap-1.5">
                {challenge.targetSequence.map((val, idx) => {
                  const done = idx < insertedSequenceCount;
                  const isNext = idx === insertedSequenceCount;
                  return (
                    <button
                      key={`${val}-${idx}`}
                      type="button"
                      disabled={!isNext}
                      onClick={() => isNext && onQuickInsertNext?.(val)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold border transition-all ${
                        done
                          ? 'bg-teal-50 text-teal-700 border-teal-200 line-through'
                          : isNext
                          ? 'bg-[#2563EB] text-white border-[#2563EB] hover:bg-blue-700 shadow-xs cursor-pointer'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                      title={
                        isNext
                          ? `Click to insert ${val} (or enter ${val} in the left panel)`
                          : undefined
                      }
                    >
                      {val}
                    </button>
                  );
                })}
                {nextBuildVal !== undefined && (
                  <span className="text-[11px] text-slate-500 ml-1">
                    Next: insert <strong className="font-mono text-slate-800">{nextBuildVal}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Level 2: Search Prediction Buttons */}
            {challenge.kind === 'search-predict' &&
              currentSearchNodeValue !== null &&
              challenge.targetValue !== undefined && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-600 mr-1">
                    At <strong className="font-mono text-amber-700">{currentSearchNodeValue}</strong>{' '}
                    searching for{' '}
                    <strong className="font-mono text-[#2563EB]">{challenge.targetValue}</strong>:
                  </span>
                  <button
                    type="button"
                    onClick={() => onPredictSearch?.('left')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#2563EB]" />
                    Go Left
                  </button>
                  <button
                    type="button"
                    onClick={() => onPredictSearch?.('found')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#0D9488] hover:bg-teal-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                    Found!
                  </button>
                  <button
                    type="button"
                    onClick={() => onPredictSearch?.('right')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Go Right
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#2563EB]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPredictSearch?.('not-found')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#DC2626] hover:bg-red-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                    Not in Tree
                  </button>
                </div>
              )}

            {/* Level 3: Deletion Case Identification */}
            {challenge.kind === 'delete-case' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {!predictedDeleteCase ? (
                  <>
                    <span className="text-xs text-slate-600 mr-1">
                      Which case is deleting{' '}
                      <strong className="font-mono text-[#DC2626]">
                        {challenge.targetValue}
                      </strong>
                      ?
                    </span>
                    {(
                      [
                        { id: 'leaf', label: 'Case 1: Leaf' },
                        { id: 'one-child', label: 'Case 2: One Child' },
                        { id: 'two-children', label: 'Case 3: Two Children' },
                      ] as { id: DeletionCase; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onPredictDeleteCase?.(opt.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onRunChallengeDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Run Delete {challenge.targetValue} Visualization
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Level 4: Traversal Progress */}
            {challenge.kind === 'traversal-predict' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <span>Click nodes on the tree:</span>
                <span className="font-mono font-semibold text-[#0D9488]">
                  {traversalPredicted.length}/{traversalTotal}
                </span>
                {traversalPredicted.length > 0 && (
                  <span className="font-mono text-slate-700">
                    [{traversalPredicted.join(', ')}]
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint Drawer */}
      {showHint && (
        <div className="rounded-lg bg-amber-50/90 border border-amber-200 px-3 py-2 text-xs text-amber-900">
          <strong>Hint:</strong> {challenge.hint}
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && !completionScore && (
        <div
          className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : feedback.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Challenge Completion Banner */}
      {completionScore && (
        <div className="rounded-lg bg-teal-50/90 border border-teal-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= completionScore.stars
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                Challenge Complete!
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-teal-200 text-[#0D9488] font-mono text-[11px]">
                  <Sparkles className="w-3 h-3" />+{completionScore.totalXp} XP
                </span>
              </p>
              <p className="text-[11px] text-teal-700">
                Base +{completionScore.baseXp}
                {completionScore.predictionXp > 0 &&
                  ` · Predictions +${completionScore.predictionXp}`}
                {completionScore.noHintBonus > 0 &&
                  ` · No Hint +${completionScore.noHintBonus}`}
                {completionScore.efficiencyBonus > 0 &&
                  ` · Zero Mistakes +${completionScore.efficiencyBonus}`}
              </p>
            </div>
          </div>

          {hasNextChallenge && (
            <button
              type="button"
              onClick={onNextChallenge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Next Challenge
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
