import { useState, type FormEvent } from 'react';
import {
  GitBranch,
  Play,
  Plus,
  Search,
  Shuffle,
  Trash2,
  ListTree,
  Eraser,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { BSTNode, OperationType, TraversalOrder } from '../types/bst.types';
import {
  countNodes,
  getTreeHeight,
  isValidBST,
  TREE_PRESETS,
} from '../algorithms/bst';
import { parseIntegerInput, parseSequenceInput } from '../utils/validation';

interface OperationPanelProps {
  root: BSTNode | null;
  selectedOperation: OperationType;
  onSelectOperation: (op: OperationType) => void;
  traversalOrder: TraversalOrder;
  onSelectTraversalOrder: (order: TraversalOrder) => void;
  inputValue: string;
  onInputValueChange: (val: string) => void;
  onExecute: (op: OperationType, value?: number, order?: TraversalOrder) => void;
  onBuildSequence: (values: number[]) => void;
  onGenerateRandom: () => void;
  onLoadPreset: (values: number[]) => void;
  onClearTree: () => void;
  disabled?: boolean;
  lockedOperation?: OperationType;
}

const OPERATIONS: { id: OperationType; label: string; icon: typeof Plus }[] = [
  { id: 'insert', label: 'Insert', icon: Plus },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'delete', label: 'Delete', icon: Trash2 },
  { id: 'traversal', label: 'Traversal', icon: ListTree },
];

export function OperationPanel({
  root,
  selectedOperation,
  onSelectOperation,
  traversalOrder,
  onSelectTraversalOrder,
  inputValue,
  onInputValueChange,
  onExecute,
  onBuildSequence,
  onGenerateRandom,
  onLoadPreset,
  onClearTree,
  disabled = false,
  lockedOperation,
}: OperationPanelProps) {
  const [sequenceInput, setSequenceInput] = useState('40, 20, 60, 10, 30');
  const [inputError, setInputError] = useState<string | null>(null);
  const [seqError, setSeqError] = useState<string | null>(null);

  const nodeCount = countNodes(root);
  const height = getTreeHeight(root);
  const valid = isValidBST(root);

  const handleOperationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInputError(null);

    if (selectedOperation === 'traversal') {
      onExecute('traversal', undefined, traversalOrder);
      return;
    }

    const parsed = parseIntegerInput(inputValue);
    if (!parsed.ok || parsed.value === undefined) {
      setInputError(parsed.error ?? 'Invalid integer.');
      return;
    }

    onExecute(selectedOperation, parsed.value);
    onInputValueChange('');
  };

  const handleSequenceSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSeqError(null);
    const parsed = parseSequenceInput(sequenceInput);
    if (!parsed.ok || !parsed.values) {
      setSeqError(parsed.error ?? 'Invalid sequence.');
      return;
    }
    onBuildSequence(parsed.values);
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#F1F5F9]/70 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-4 overflow-y-auto">
      {/* Operation Selection */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Operation
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {OPERATIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedOperation === id;
            const isLockedOut = Boolean(lockedOperation && lockedOperation !== id);
            return (
              <button
                key={id}
                type="button"
                disabled={disabled || isLockedOut}
                onClick={() => {
                  onSelectOperation(id);
                  setInputError(null);
                }}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } disabled:opacity-45 disabled:cursor-not-allowed`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Target Value / Traversal Picker */}
      <section>
        <form onSubmit={handleOperationSubmit} className="space-y-2.5">
          {selectedOperation === 'traversal' ? (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Traversal Order
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'inorder', label: 'Inorder' },
                    { id: 'preorder', label: 'Preorder' },
                    { id: 'postorder', label: 'Postorder' },
                    { id: 'bfs', label: 'BFS (Level)' },
                  ] as { id: TraversalOrder; label: string }[]
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectTraversalOrder(id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      traversalOrder === id
                        ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                {traversalOrder === 'inorder' && 'Left → Root → Right (sorted output)'}
                {traversalOrder === 'preorder' && 'Root → Left → Right'}
                {traversalOrder === 'postorder' && 'Left → Right → Root'}
                {traversalOrder === 'bfs' && 'Level by level using a FIFO queue'}
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="bst-value-input"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Target Integer
              </label>
              <input
                id="bst-value-input"
                type="text"
                inputMode="numeric"
                value={inputValue}
                disabled={disabled}
                onChange={(e) => {
                  onInputValueChange(e.target.value);
                  setInputError(null);
                }}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] disabled:opacity-50"
              />
              {inputError && (
                <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {inputError}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Execute{' '}
            {selectedOperation === 'traversal'
              ? traversalOrder === 'bfs'
                ? 'BFS'
                : traversalOrder
              : selectedOperation}
          </button>
        </form>
      </section>

      {/* Playground-only Quick Builders */}
      {!lockedOperation && (
        <>
          <hr className="border-slate-200" />

          {/* Build from Sequence */}
          <section>
            <form onSubmit={handleSequenceSubmit} className="space-y-1.5">
              <label
                htmlFor="bst-seq-input"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Build from Sequence
              </label>
              <div className="flex gap-1.5">
                <input
                  id="bst-seq-input"
                  type="text"
                  value={sequenceInput}
                  onChange={(e) => {
                    setSequenceInput(e.target.value);
                    setSeqError(null);
                  }}
                  placeholder="40, 20, 60, 10, 30"
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shrink-0"
                >
                  Build
                </button>
              </div>
              {seqError && <p className="text-[11px] text-[#DC2626]">{seqError}</p>}
            </form>
          </section>

          {/* Random & Clear */}
          <section className="flex gap-1.5">
            <button
              type="button"
              onClick={onGenerateRandom}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#2563EB]" />
              Random Tree
            </button>
            <button
              type="button"
              onClick={onClearTree}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-[#DC2626] hover:border-red-200 text-xs font-medium text-slate-600 inline-flex items-center justify-center gap-1 transition-colors"
              title="Clear tree"
            >
              <Eraser className="w-3.5 h-3.5" />
              Clear
            </button>
          </section>

          {/* Presets */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Preset Examples
            </h3>
            <div className="space-y-1.5">
              {TREE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onLoadPreset(preset.values)}
                  className="w-full text-left px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#2563EB]/50 hover:bg-blue-50/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      {preset.name}
                    </span>
                    <GitBranch className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Live Tree Telemetry */}
      <section className="mt-auto pt-2 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-white rounded-lg border border-slate-200/80 py-1.5 px-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Nodes
            </div>
            <div className="font-mono text-xs font-bold text-slate-800">{nodeCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200/80 py-1.5 px-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Height
            </div>
            <div className="font-mono text-xs font-bold text-slate-800">{height}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200/80 py-1.5 px-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              BST Valid
            </div>
            <div className="flex items-center justify-center mt-0.5">
              {valid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
              )}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
