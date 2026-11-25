import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BSTNode, OperationStep } from '../types/bst.types';
import { computeEmptySlotPosition, computeTreeLayout } from '../utils/treeLayout';
import {
  TREE_MOTION_TRANSITION,
  TreeNode,
  type NodeVisualState,
} from './TreeNode';

interface TreeVisualizerProps {
  root: BSTNode | null;
  step: OperationStep | null;
  /** All steps of the current operation so viewBox stays stable without jumping */
  allSteps?: OperationStep[];
  /** Optional overrides for interactive challenge modes */
  challengeActiveNodeId?: string | null;
  challengeVisitedValues?: number[];
  challengeErrorNodeValue?: number | null;
  onNodeClick?: (value: number) => void;
  clickableNodes?: boolean;
}

export function TreeVisualizer({
  root,
  step,
  allSteps,
  challengeActiveNodeId,
  challengeVisitedValues = [],
  challengeErrorNodeValue = null,
  onNodeClick,
  clickableNodes = false,
}: TreeVisualizerProps) {
  const displayRoot = step ? step.treeSnapshot.root : root;

  const layout = useMemo(() => computeTreeLayout(displayRoot), [displayRoot]);

  // Compute a stable viewBox across the entire operation so the SVG never zooms/jumps mid-step
  const stableBounds = useMemo(() => {
    let maxW = Math.max(layout.width, 640);
    let maxH = Math.max(layout.height, 360);

    if (allSteps && allSteps.length > 0) {
      const lastLayout = computeTreeLayout(
        allSteps[allSteps.length - 1].treeSnapshot.root
      );
      maxW = Math.max(maxW, lastLayout.width);
      maxH = Math.max(maxH, lastLayout.height);

      for (const s of allSteps) {
        if (s.emptySlot) {
          const sLayout = computeTreeLayout(s.treeSnapshot.root);
          const slot = computeEmptySlotPosition(
            sLayout,
            s.emptySlot.parentId,
            s.emptySlot.direction
          );
          maxW = Math.max(maxW, slot.x + 64);
          maxH = Math.max(maxH, slot.y + 64);
        }
      }
    }

    return { width: maxW, height: maxH };
  }, [layout.width, layout.height, allSteps]);

  const highlightedSet = useMemo(
    () => new Set(step?.highlightedNodeIds ?? []),
    [step]
  );
  const successSet = useMemo(
    () => new Set(step?.successNodeIds ?? []),
    [step]
  );

  const emptySlotPos = useMemo(() => {
    if (!step?.emptySlot) return null;
    return computeEmptySlotPosition(
      layout,
      step.emptySlot.parentId,
      step.emptySlot.direction
    );
  }, [layout, step?.emptySlot]);

  const getNodeState = (id: string, value: number): NodeVisualState => {
    if (challengeErrorNodeValue === value) return 'error';
    if (challengeActiveNodeId && id === challengeActiveNodeId) return 'active';
    if (challengeVisitedValues.includes(value)) return 'predicted';
    if (step?.errorNodeId === id) return 'error';
    if (step?.successorNodeId === id) return 'successor';
    if (step?.activeNodeId === id) return 'active';
    if (successSet.has(id)) return 'success';
    if (highlightedSet.has(id)) return 'path';
    return 'default';
  };

  const getVisitBadge = (value: number): string | undefined => {
    const challengeIdx = challengeVisitedValues.indexOf(value);
    if (challengeIdx !== -1) return String(challengeIdx + 1);
    if (step?.traversalOutput) {
      const idx = step.traversalOutput.indexOf(value);
      if (idx !== -1) return String(idx + 1);
    }
    return undefined;
  };

  // Horizontal offset to keep the current tree centered inside the stable viewBox
  const centerOffsetX = Math.max(0, (stableBounds.width - layout.width) / 2);

  const hasTraversalFooter =
    (step?.traversalOutput && step.traversalOutput.length > 0) ||
    step?.queueValues !== undefined;

  return (
    <div className="relative flex-1 w-full h-full min-h-[300px] bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col">
      {/* Subtle top-right legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEF3C7] border border-[#D97706]" />
          Active
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EFF6FF] border border-[#2563EB]" />
          Path
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFBF1] border border-[#0D9488]" />
          Success
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEE2E2] border border-[#DC2626]" />
          Delete / Error
        </span>
      </div>

      {/* Live comparison pill overlay */}
      <AnimatePresence>
        {step?.comparisonText && (
          <motion.div
            key={step.comparisonText + (step.activeNodeId ?? '')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-1.5 shadow-xs"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Compare
            </span>
            <span className="font-mono text-sm font-semibold text-amber-900">
              {step.comparisonText}
            </span>
            {step.direction && (
              <span className="text-xs font-medium text-amber-700">
                → Go {step.direction}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SVG canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-2 overflow-auto">
        {!displayRoot && !emptySlotPos ? (
          <div className="text-center max-w-xs px-4 py-8">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-mono text-sm">
              ∅
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Empty Binary Search Tree
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Insert an integer or load a preset from the left panel to begin visualizing.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${stableBounds.width} ${stableBounds.height}`}
            className="w-full h-full max-h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Connecting edges — synchronized tween with TreeNode so lines never detach */}
            <g>
              <AnimatePresence>
                {layout.edges.map((edge) => {
                  const isPathEdge =
                    highlightedSet.has(edge.fromId) &&
                    highlightedSet.has(edge.toId);
                  const x1 = edge.x1 + centerOffsetX;
                  const x2 = edge.x2 + centerOffsetX;
                  return (
                    <motion.line
                      key={edge.id}
                      initial={{
                        opacity: 0,
                        x1,
                        y1: edge.y1,
                        x2: x1,
                        y2: edge.y1,
                      }}
                      animate={{
                        opacity: 1,
                        x1,
                        y1: edge.y1,
                        x2,
                        y2: edge.y2,
                      }}
                      exit={{ opacity: 0 }}
                      transition={TREE_MOTION_TRANSITION}
                      stroke={isPathEdge ? '#2563EB' : '#CBD5E1'}
                      strokeWidth={isPathEdge ? 2.75 : 2}
                      strokeLinecap="round"
                    />
                  );
                })}
              </AnimatePresence>

              {/* Dashed edge to empty child slot */}
              {emptySlotPos &&
                emptySlotPos.fromX !== undefined &&
                emptySlotPos.fromY !== undefined && (
                  <motion.line
                    key={`empty-edge-${step?.emptySlot?.parentId}-${step?.emptySlot?.direction}`}
                    initial={{
                      opacity: 0,
                      x1: emptySlotPos.fromX + centerOffsetX,
                      y1: emptySlotPos.fromY,
                      x2: emptySlotPos.fromX + centerOffsetX,
                      y2: emptySlotPos.fromY,
                    }}
                    animate={{
                      opacity: 1,
                      x1: emptySlotPos.fromX + centerOffsetX,
                      y1: emptySlotPos.fromY,
                      x2: emptySlotPos.x + centerOffsetX,
                      y2: emptySlotPos.y,
                    }}
                    transition={TREE_MOTION_TRANSITION}
                    stroke="#D97706"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
            </g>

            {/* Empty slot placeholder — positioned via Framer Motion x/y (never SVG transform attr) */}
            <AnimatePresence>
              {emptySlotPos && (
                <motion.g
                  key={`empty-slot-${step?.emptySlot?.parentId ?? 'root'}-${step?.emptySlot?.direction ?? 'root'}`}
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    x: (emptySlotPos.fromX ?? emptySlotPos.x) + centerOffsetX,
                    y: emptySlotPos.fromY ?? emptySlotPos.y,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: emptySlotPos.x + centerOffsetX,
                    y: emptySlotPos.y,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={TREE_MOTION_TRANSITION}
                >
                  <circle
                    r={22}
                    fill="#FFFBEB"
                    stroke="#D97706"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#B45309"
                    fontSize={12}
                    fontWeight={600}
                    fontFamily="var(--font-mono)"
                  >
                    {step?.emptySlot?.label ?? 'null'}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Tree Nodes — new nodes spawn smoothly from their parent's position */}
            <AnimatePresence>
              {layout.nodes.map((node) => {
                const parent = node.parentId
                  ? layout.nodeMap[node.parentId]
                  : undefined;
                const nodeX = node.x + centerOffsetX;
                const spawnX = parent ? parent.x + centerOffsetX : nodeX;
                const spawnY = parent ? parent.y : node.y;
                return (
                  <TreeNode
                    key={node.id}
                    id={node.id}
                    value={node.value}
                    x={nodeX}
                    y={node.y}
                    spawnX={spawnX}
                    spawnY={spawnY}
                    state={getNodeState(node.id, node.value)}
                    badgeText={getVisitBadge(node.value)}
                    clickable={clickableNodes}
                    onClick={(val) => onNodeClick?.(val)}
                  />
                );
              })}
            </AnimatePresence>
          </svg>
        )}
      </div>

      {/* Traversal Output & BFS Queue strip */}
      {hasTraversalFooter && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 overflow-x-auto">
          {step?.traversalOutput && step.traversalOutput.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
                Output:
              </span>
              <div className="flex items-center gap-1.5">
                {step.traversalOutput.map((val, idx) => (
                  <motion.span
                    key={`${val}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1"
                  >
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-semibold">
                      {val}
                    </span>
                    {idx < step.traversalOutput!.length - 1 && (
                      <span className="text-slate-400 text-xs">→</span>
                    )}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {step?.queueValues !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 shrink-0">
                BFS Queue:
              </span>
              {step.queueValues.length === 0 ? (
                <span className="text-xs font-mono text-slate-400">[ empty ]</span>
              ) : (
                <div className="flex items-center gap-1">
                  {step.queueValues.map((val, idx) => (
                    <span
                      key={`q-${val}-${idx}`}
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-semibold border ${
                        idx === 0
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                      title={idx === 0 ? 'Front of queue (next to dequeue)' : undefined}
                    >
                      {val}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
