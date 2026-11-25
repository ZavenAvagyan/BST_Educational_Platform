import type { BSTNode, OperationResult, OperationStep } from '../types/bst.types';
import { cloneTree, createNode, createSnapshot } from './bst';

export function insertWithSteps(
  initialRoot: BSTNode | null,
  value: number
): OperationResult {
  const workingRoot = cloneTree(initialRoot);
  const steps: OperationStep[] = [];

  if (!Number.isInteger(value)) {
    steps.push({
      type: 'error',
      title: 'Invalid input',
      description: 'Only integer values can be inserted into this Binary Search Tree.',
      reasoning: 'BST Quest operates on unique integers so comparisons are unambiguous.',
      highlightedNodeIds: [],
      treeSnapshot: createSnapshot(workingRoot),
    });
    return {
      operation: 'insert',
      targetValue: value,
      success: false,
      steps,
      finalRoot: workingRoot,
      errorMessage: 'Please enter a valid integer.',
    };
  }

  // Case: empty tree
  if (!workingRoot) {
    steps.push({
      type: 'start',
      title: `Insert ${value} into empty tree`,
      description: `The tree is currently empty, so ${value} will become the root node.`,
      reasoning:
        'When a Binary Search Tree has no nodes, the first inserted value always becomes the root.',
      nextHint: `Insert ${value} as the root.`,
      highlightedNodeIds: [],
      emptySlot: { parentId: null, label: `${value}` },
      treeSnapshot: createSnapshot(null),
    });

    const newRoot = createNode(value);
    steps.push({
      type: 'insert',
      title: `Inserted ${value} as root`,
      description: `Created root node with value ${value}.`,
      reasoning: 'A single-node tree trivially satisfies the BST property.',
      highlightedNodeIds: [newRoot.id],
      successNodeIds: [newRoot.id],
      treeSnapshot: createSnapshot(newRoot),
    });

    steps.push({
      type: 'complete',
      title: `Insertion complete`,
      description: `${value} is now the root of the BST.`,
      reasoning: 'Insertion into an empty tree takes O(1) time.',
      highlightedNodeIds: [newRoot.id],
      successNodeIds: [newRoot.id],
      treeSnapshot: createSnapshot(newRoot),
    });

    return {
      operation: 'insert',
      targetValue: value,
      success: true,
      steps,
      finalRoot: newRoot,
    };
  }

  // Step 0: Start at root
  steps.push({
    type: 'start',
    title: `Start inserting ${value}`,
    description: `Begin at the root node (${workingRoot.value}) to find the proper position for ${value}.`,
    reasoning:
      'Every BST insertion starts at the root and follows left/right branches using the BST ordering property.',
    nextHint: `Compare ${value} with ${workingRoot.value}.`,
    highlightedNodeIds: [workingRoot.id],
    activeNodeId: workingRoot.id,
    treeSnapshot: createSnapshot(workingRoot),
  });

  const pathIds: string[] = [];
  let current: BSTNode = workingRoot;

  while (true) {
    pathIds.push(current.id);

    // Duplicate check
    if (value === current.value) {
      steps.push({
        type: 'error',
        title: `Duplicate value ${value}`,
        description: `Value ${value} already exists in the tree. Duplicate values are rejected.`,
        reasoning:
          'This BST stores unique integers so every value has a single canonical position.',
        comparisonText: `${value} == ${current.value}`,
        highlightedNodeIds: [...pathIds],
        errorNodeId: current.id,
        treeSnapshot: createSnapshot(workingRoot),
      });

      return {
        operation: 'insert',
        targetValue: value,
        success: false,
        steps,
        finalRoot: workingRoot,
        errorMessage: `Value ${value} already exists in the tree.`,
      };
    }

    if (value < current.value) {
      if (current.left) {
        steps.push({
          type: 'compare',
          title: `Compare ${value} with ${current.value}`,
          description: `${value} is smaller than ${current.value}, so move to the left child (${current.left.value}).`,
          reasoning:
            'The BST property requires all values smaller than a node to reside in its left subtree.',
          comparisonText: `${value} < ${current.value}`,
          nextHint: `Compare ${value} with ${current.left.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'left',
          treeSnapshot: createSnapshot(workingRoot),
        });
        current = current.left;
      } else {
        steps.push({
          type: 'compare',
          title: `Compare ${value} with ${current.value}`,
          description: `${value} is smaller than ${current.value}, and the left child position is empty.`,
          reasoning:
            'We reached a null left pointer, which is the exact insertion spot that preserves the BST property.',
          comparisonText: `${value} < ${current.value}`,
          nextHint: `Insert ${value} as the left child of ${current.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'left',
          emptySlot: { parentId: current.id, direction: 'left', label: `${value}` },
          treeSnapshot: createSnapshot(workingRoot),
        });

        const newNode = createNode(value);
        current.left = newNode;
        const fullPath = [...pathIds, newNode.id];

        steps.push({
          type: 'insert',
          title: `Insert ${value}`,
          description: `Inserted ${value} as the left child of ${current.value}.`,
          reasoning: `All ancestors remain valid because ${value} followed every BST comparison from the root.`,
          highlightedNodeIds: fullPath,
          successNodeIds: [newNode.id],
          treeSnapshot: createSnapshot(workingRoot),
        });

        steps.push({
          type: 'complete',
          title: `Insertion complete`,
          description: `Successfully inserted ${value} after ${pathIds.length} comparison${pathIds.length === 1 ? '' : 's'}.`,
          reasoning:
            'Insertion visits one node per level along a single root-to-leaf path: O(log n) average, O(n) worst case.',
          highlightedNodeIds: fullPath,
          successNodeIds: [newNode.id],
          treeSnapshot: createSnapshot(workingRoot),
        });

        return {
          operation: 'insert',
          targetValue: value,
          success: true,
          steps,
          finalRoot: workingRoot,
        };
      }
    } else {
      if (current.right) {
        steps.push({
          type: 'compare',
          title: `Compare ${value} with ${current.value}`,
          description: `${value} is greater than ${current.value}, so move to the right child (${current.right.value}).`,
          reasoning:
            'The BST property requires all values greater than a node to reside in its right subtree.',
          comparisonText: `${value} > ${current.value}`,
          nextHint: `Compare ${value} with ${current.right.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'right',
          treeSnapshot: createSnapshot(workingRoot),
        });
        current = current.right;
      } else {
        steps.push({
          type: 'compare',
          title: `Compare ${value} with ${current.value}`,
          description: `${value} is greater than ${current.value}, and the right child position is empty.`,
          reasoning:
            'We reached a null right pointer, which is the exact insertion spot that preserves the BST property.',
          comparisonText: `${value} > ${current.value}`,
          nextHint: `Insert ${value} as the right child of ${current.value}.`,
          highlightedNodeIds: [...pathIds],
          activeNodeId: current.id,
          direction: 'right',
          emptySlot: { parentId: current.id, direction: 'right', label: `${value}` },
          treeSnapshot: createSnapshot(workingRoot),
        });

        const newNode = createNode(value);
        current.right = newNode;
        const fullPath = [...pathIds, newNode.id];

        steps.push({
          type: 'insert',
          title: `Insert ${value}`,
          description: `Inserted ${value} as the right child of ${current.value}.`,
          reasoning: `All ancestors remain valid because ${value} followed every BST comparison from the root.`,
          highlightedNodeIds: fullPath,
          successNodeIds: [newNode.id],
          treeSnapshot: createSnapshot(workingRoot),
        });

        steps.push({
          type: 'complete',
          title: `Insertion complete`,
          description: `Successfully inserted ${value} after ${pathIds.length} comparison${pathIds.length === 1 ? '' : 's'}.`,
          reasoning:
            'Insertion visits one node per level along a single root-to-leaf path: O(log n) average, O(n) worst case.',
          highlightedNodeIds: fullPath,
          successNodeIds: [newNode.id],
          treeSnapshot: createSnapshot(workingRoot),
        });

        return {
          operation: 'insert',
          targetValue: value,
          success: true,
          steps,
          finalRoot: workingRoot,
        };
      }
    }
  }
}
