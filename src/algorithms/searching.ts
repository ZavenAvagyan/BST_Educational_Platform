import type { BSTNode, OperationResult, OperationStep } from '../types/bst.types';
import { cloneTree, createSnapshot } from './bst';

export function searchWithSteps(
  initialRoot: BSTNode | null,
  target: number
): OperationResult {
  const workingRoot = cloneTree(initialRoot);
  const steps: OperationStep[] = [];

  if (!workingRoot) {
    steps.push({
      type: 'not-found',
      title: `${target} not found`,
      description: `The tree is empty, so ${target} cannot exist in the BST.`,
      reasoning: 'Searching an empty tree immediately terminates with a null reference.',
      highlightedNodeIds: [],
      treeSnapshot: createSnapshot(null),
    });

    return {
      operation: 'search',
      targetValue: target,
      success: false,
      steps,
      finalRoot: workingRoot,
    };
  }

  steps.push({
    type: 'start',
    title: `Start searching for ${target}`,
    description: `Start at the root node (${workingRoot.value}) and compare it with ${target}.`,
    reasoning:
      'BST search eliminates an entire half-subtree at every step by comparing the target with the current node.',
    nextHint: `Compare ${target} with ${workingRoot.value}.`,
    highlightedNodeIds: [workingRoot.id],
    activeNodeId: workingRoot.id,
    treeSnapshot: createSnapshot(workingRoot),
  });

  const pathIds: string[] = [];
  let current: BSTNode | null = workingRoot;

  while (current) {
    pathIds.push(current.id);

    if (target === current.value) {
      steps.push({
        type: 'found',
        title: `Found ${target}!`,
        description: `Match found at node ${current.value} after ${pathIds.length} comparison${pathIds.length === 1 ? '' : 's'}.`,
        reasoning:
          'Because we followed the BST ordering invariant at every node, finding equality confirms the value is present.',
        comparisonText: `${target} == ${current.value}`,
        highlightedNodeIds: [...pathIds],
        successNodeIds: [current.id],
        treeSnapshot: createSnapshot(workingRoot),
      });

      return {
        operation: 'search',
        targetValue: target,
        success: true,
        steps,
        finalRoot: workingRoot,
      };
    }

    if (target < current.value) {
      if (current.left) {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `Since ${target} is smaller than ${current.value}, continue searching in the left subtree.`,
          reasoning:
            'The Binary Search Tree property guarantees that values smaller than the current node can only be in its left subtree.',
          comparisonText: `${target} < ${current.value}`,
          nextHint: `Compare ${target} with ${current.left.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'left',
          treeSnapshot: createSnapshot(workingRoot),
        });
        current = current.left;
      } else {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `${target} is smaller than ${current.value}, so we look left—but there is no left child.`,
          reasoning:
            'If the target existed in the BST, it would have to be in this empty left subtree.',
          comparisonText: `${target} < ${current.value}`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'left',
          emptySlot: { parentId: current.id, direction: 'left', label: 'null' },
          treeSnapshot: createSnapshot(workingRoot),
        });

        steps.push({
          type: 'not-found',
          title: `${target} not found`,
          description: `Reached a null left link from ${current.value}. ${target} is not in the tree.`,
          reasoning:
            'Reaching an empty child proves the target does not exist anywhere else in the BST.',
          highlightedNodeIds: [...pathIds],
          errorNodeId: current.id,
          treeSnapshot: createSnapshot(workingRoot),
        });

        return {
          operation: 'search',
          targetValue: target,
          success: false,
          steps,
          finalRoot: workingRoot,
        };
      }
    } else {
      if (current.right) {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `Since ${target} is greater than ${current.value}, continue searching in the right subtree.`,
          reasoning:
            'The Binary Search Tree property guarantees that values greater than the current node can only be in its right subtree.',
          comparisonText: `${target} > ${current.value}`,
          nextHint: `Compare ${target} with ${current.right.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'right',
          treeSnapshot: createSnapshot(workingRoot),
        });
        current = current.right;
      } else {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `${target} is greater than ${current.value}, so we look right—but there is no right child.`,
          reasoning:
            'If the target existed in the BST, it would have to be in this empty right subtree.',
          comparisonText: `${target} > ${current.value}`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'right',
          emptySlot: { parentId: current.id, direction: 'right', label: 'null' },
          treeSnapshot: createSnapshot(workingRoot),
        });

        steps.push({
          type: 'not-found',
          title: `${target} not found`,
          description: `Reached a null right link from ${current.value}. ${target} is not in the tree.`,
          reasoning:
            'Reaching an empty child proves the target does not exist anywhere else in the BST.',
          highlightedNodeIds: [...pathIds],
          errorNodeId: current.id,
          treeSnapshot: createSnapshot(workingRoot),
        });

        return {
          operation: 'search',
          targetValue: target,
          success: false,
          steps,
          finalRoot: workingRoot,
        };
      }
    }
  }

  return {
    operation: 'search',
    targetValue: target,
    success: false,
    steps,
    finalRoot: workingRoot,
  };
}
