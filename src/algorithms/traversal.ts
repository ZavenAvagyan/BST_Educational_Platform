import type {
  BSTNode,
  OperationResult,
  OperationStep,
  TraversalOrder,
} from '../types/bst.types';
import { cloneTree, createSnapshot } from './bst';

const ORDER_LABELS: Record<TraversalOrder, { name: string; rule: string; note: string }> = {
  inorder: {
    name: 'Inorder Traversal',
    rule: 'Left → Root → Right',
    note: 'In a BST, inorder traversal always visits values in strictly ascending sorted order.',
  },
  preorder: {
    name: 'Preorder Traversal',
    rule: 'Root → Left → Right',
    note: 'Preorder visits each root before its subtrees—useful for cloning or serializing tree structure.',
  },
  postorder: {
    name: 'Postorder Traversal',
    rule: 'Left → Right → Root',
    note: 'Postorder visits children before their parent—useful for safely deleting or freeing a tree.',
  },
  bfs: {
    name: 'Breadth-First Search (BFS)',
    rule: 'Level by Level (Left → Right)',
    note: 'BFS uses a FIFO queue to visit every node at depth d before moving to depth d + 1.',
  },
};

export function traverseWithSteps(
  initialRoot: BSTNode | null,
  order: TraversalOrder
): OperationResult {
  const workingRoot = cloneTree(initialRoot);
  const steps: OperationStep[] = [];
  const meta = ORDER_LABELS[order];

  if (!workingRoot) {
    steps.push({
      type: 'complete',
      title: `${meta.name} on empty tree`,
      description: 'The tree is empty, so the traversal output is [].',
      reasoning: meta.note,
      highlightedNodeIds: [],
      traversalOutput: [],
      ...(order === 'bfs' ? { queueValues: [] } : {}),
      treeSnapshot: createSnapshot(null),
    });

    return {
      operation: 'traversal',
      traversalOrder: order,
      success: true,
      steps,
      finalRoot: null,
      traversalSequence: [],
    };
  }

  const snapshot = createSnapshot(workingRoot);
  const visitedIds: string[] = [];
  const output: number[] = [];

  if (order === 'bfs') {
    const queue: BSTNode[] = [workingRoot];

    steps.push({
      type: 'start',
      title: `Start ${meta.name}`,
      description: `Enqueue the root (${workingRoot.value}) and explore the tree level by level.`,
      reasoning: meta.note,
      nextHint: `Dequeue and visit ${workingRoot.value}.`,
      highlightedNodeIds: [workingRoot.id],
      activeNodeId: workingRoot.id,
      traversalOutput: [],
      queueValues: queue.map((n) => n.value),
      treeSnapshot: snapshot,
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      visitedIds.push(current.id);
      output.push(current.value);

      const enqueuedChildren: number[] = [];
      if (current.left) {
        queue.push(current.left);
        enqueuedChildren.push(current.left.value);
      }
      if (current.right) {
        queue.push(current.right);
        enqueuedChildren.push(current.right.value);
      }

      const enqueueDesc =
        enqueuedChildren.length > 0
          ? ` Enqueue child${enqueuedChildren.length > 1 ? 'ren' : ''}: ${enqueuedChildren.join(', ')}.`
          : ' No children to enqueue.';

      steps.push({
        type: 'visit',
        title: `Visit ${current.value}`,
        description: `Dequeue ${current.value} and append to output.${enqueueDesc}`,
        reasoning: `BFS processes nodes in FIFO queue order, ensuring each level finishes before the next begins.`,
        nextHint:
          queue.length > 0
            ? `Next in queue: dequeue ${queue[0].value}.`
            : 'Queue is now empty.',
        highlightedNodeIds: [...visitedIds, ...queue.map((n) => n.id)],
        activeNodeId: current.id,
        successNodeIds: [...visitedIds],
        traversalOutput: [...output],
        queueValues: queue.map((n) => n.value),
        treeSnapshot: snapshot,
      });
    }

    steps.push({
      type: 'complete',
      title: `${meta.name} complete`,
      description: `Visited all ${output.length} nodes level by level: [${output.join(', ')}].`,
      reasoning: `${meta.note} Time complexity is O(n) and queue space is O(w), where w is the maximum tree width.`,
      highlightedNodeIds: [...visitedIds],
      successNodeIds: [...visitedIds],
      traversalOutput: [...output],
      queueValues: [],
      treeSnapshot: snapshot,
    });

    return {
      operation: 'traversal',
      traversalOrder: 'bfs',
      success: true,
      steps,
      finalRoot: workingRoot,
      traversalSequence: output,
    };
  }

  // Depth-First Traversals (Inorder, Preorder, Postorder)
  steps.push({
    type: 'start',
    title: `Start ${meta.name}`,
    description: `Traverse the tree using ${meta.rule}.`,
    reasoning: meta.note,
    highlightedNodeIds: [workingRoot.id],
    activeNodeId: workingRoot.id,
    traversalOutput: [],
    treeSnapshot: snapshot,
  });

  function visitNode(node: BSTNode) {
    visitedIds.push(node.id);
    output.push(node.value);

    steps.push({
      type: 'visit',
      title: `Visit ${node.value}`,
      description: `Record ${node.value} into the ${order} sequence (${output.join(' → ')}).`,
      reasoning: `Following ${meta.rule}, node ${node.value} is next to be visited.`,
      highlightedNodeIds: [...visitedIds],
      activeNodeId: node.id,
      successNodeIds: [...visitedIds],
      traversalOutput: [...output],
      treeSnapshot: snapshot,
    });
  }

  function walk(node: BSTNode | null) {
    if (!node) return;
    if (order === 'preorder') {
      visitNode(node);
      walk(node.left);
      walk(node.right);
    } else if (order === 'inorder') {
      walk(node.left);
      visitNode(node);
      walk(node.right);
    } else {
      walk(node.left);
      walk(node.right);
      visitNode(node);
    }
  }

  walk(workingRoot);

  steps.push({
    type: 'complete',
    title: `${meta.name} complete`,
    description: `Visited all ${output.length} nodes: [${output.join(', ')}].`,
    reasoning: `${meta.note} Every node is visited exactly once, giving O(n) time complexity.`,
    highlightedNodeIds: [...visitedIds],
    successNodeIds: [...visitedIds],
    traversalOutput: [...output],
    treeSnapshot: snapshot,
  });

  return {
    operation: 'traversal',
    traversalOrder: order,
    success: true,
    steps,
    finalRoot: workingRoot,
    traversalSequence: output,
  };
}
