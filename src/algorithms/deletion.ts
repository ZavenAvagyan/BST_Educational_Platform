import type {
  BSTNode,
  DeletionCase,
  Direction,
  OperationResult,
  OperationStep,
} from '../types/bst.types';
import { cloneTree, createSnapshot } from './bst';

export function deleteWithSteps(
  initialRoot: BSTNode | null,
  target: number
): OperationResult {
  let workingRoot = cloneTree(initialRoot);
  const steps: OperationStep[] = [];

  if (!workingRoot) {
    steps.push({
      type: 'not-found',
      title: `Cannot delete ${target}`,
      description: `The tree is empty, so ${target} does not exist.`,
      reasoning: 'Deletion requires first locating the target node in the tree.',
      highlightedNodeIds: [],
      treeSnapshot: createSnapshot(null),
    });

    return {
      operation: 'delete',
      targetValue: target,
      success: false,
      steps,
      finalRoot: null,
      errorMessage: `Value ${target} is not in the tree.`,
    };
  }

  steps.push({
    type: 'start',
    title: `Start deleting ${target}`,
    description: `Search from the root (${workingRoot.value}) to locate ${target}.`,
    reasoning:
      'BST deletion begins with a standard BST search to find the target node and its parent.',
    nextHint: `Compare ${target} with ${workingRoot.value}.`,
    highlightedNodeIds: [workingRoot.id],
    activeNodeId: workingRoot.id,
    treeSnapshot: createSnapshot(workingRoot),
  });

  const pathIds: string[] = [];
  let parent: BSTNode | null = null;
  let parentSide: Direction | null = null;
  let current: BSTNode | null = workingRoot;

  // Phase 1: Locate the node
  while (current && current.value !== target) {
    pathIds.push(current.id);
    if (target < current.value) {
      if (!current.left) {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `${target} < ${current.value}, so look left—but the left child is empty.`,
          reasoning:
            'Values smaller than the current node would appear in its left subtree.',
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
          description: `Value ${target} does not exist in the tree, so no node was deleted.`,
          reasoning: 'Reached a null pointer during search; deletion terminates cleanly.',
          highlightedNodeIds: [...pathIds],
          errorNodeId: current.id,
          treeSnapshot: createSnapshot(workingRoot),
        });
        return {
          operation: 'delete',
          targetValue: target,
          success: false,
          steps,
          finalRoot: workingRoot,
          errorMessage: `Value ${target} is not in the tree.`,
        };
      }

      steps.push({
        type: 'compare',
        title: `Compare ${target} with ${current.value}`,
        description: `${target} is smaller than ${current.value}, so move to the left child (${current.left.value}).`,
        reasoning: 'Follow the BST property to locate the target node.',
        comparisonText: `${target} < ${current.value}`,
        nextHint: `Compare ${target} with ${current.left.value}.`,
        highlightedNodeIds: [...pathIds],
        activeNodeId: current.id,
        direction: 'left',
        treeSnapshot: createSnapshot(workingRoot),
      });

      parent = current;
      parentSide = 'left';
      current = current.left;
    } else {
      if (!current.right) {
        steps.push({
          type: 'compare',
          title: `Compare ${target} with ${current.value}`,
          description: `${target} > ${current.value}, so look right—but the right child is empty.`,
          reasoning:
            'Values greater than the current node would appear in its right subtree.',
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
          description: `Value ${target} does not exist in the tree, so no node was deleted.`,
          reasoning: 'Reached a null pointer during search; deletion terminates cleanly.',
          highlightedNodeIds: [...pathIds],
          errorNodeId: current.id,
          treeSnapshot: createSnapshot(workingRoot),
        });
        return {
          operation: 'delete',
          targetValue: target,
          success: false,
          steps,
          finalRoot: workingRoot,
          errorMessage: `Value ${target} is not in the tree.`,
        };
      }

      steps.push({
        type: 'compare',
        title: `Compare ${target} with ${current.value}`,
        description: `${target} is greater than ${current.value}, so move to the right child (${current.right.value}).`,
        reasoning: 'Follow the BST property to locate the target node.',
        comparisonText: `${target} > ${current.value}`,
        nextHint: `Compare ${target} with ${current.right.value}.`,
        highlightedNodeIds: [...pathIds],
        activeNodeId: current.id,
        direction: 'right',
        treeSnapshot: createSnapshot(workingRoot),
      });

      parent = current;
      parentSide = 'right';
      current = current.right;
    }
  }

  if (!current) {
    return {
      operation: 'delete',
      targetValue: target,
      success: false,
      steps,
      finalRoot: workingRoot,
      errorMessage: `Value ${target} is not in the tree.`,
    };
  }

  pathIds.push(current.id);

  // Determine deletion case
  const hasLeft = current.left !== null;
  const hasRight = current.right !== null;
  let deletionCase: DeletionCase;

  if (!hasLeft && !hasRight) {
    deletionCase = 'leaf';
  } else if (hasLeft && hasRight) {
    deletionCase = 'two-children';
  } else {
    deletionCase = 'one-child';
  }

  // Case 1: Leaf node
  if (deletionCase === 'leaf') {
    steps.push({
      type: 'found',
      title: `Found ${target} — Case 1: Leaf Node`,
      description: `Node ${target} has no children. It can be removed directly.`,
      reasoning:
        'Removing a leaf node does not affect any descendants, so the BST property remains intact.',
      comparisonText: `${target} == ${current.value}`,
      nextHint: `Remove leaf node ${target}.`,
      highlightedNodeIds: [...pathIds],
      errorNodeId: current.id,
      deletionCase: 'leaf',
      treeSnapshot: createSnapshot(workingRoot),
    });

    if (!parent) {
      workingRoot = null;
    } else if (parentSide === 'left') {
      parent.left = null;
    } else {
      parent.right = null;
    }

    steps.push({
      type: 'delete',
      title: `Removed leaf node ${target}`,
      description: parent
        ? `Disconnected ${target} from its parent (${parent.value}).`
        : `Removed ${target}. The tree is now empty.`,
      reasoning:
        'Case 1 deletion simply sets the parent pointer (or root reference) to null.',
      highlightedNodeIds: parent ? [parent.id] : [],
      successNodeIds: parent ? [parent.id] : [],
      deletionCase: 'leaf',
      treeSnapshot: createSnapshot(workingRoot),
    });

    steps.push({
      type: 'complete',
      title: `Deletion complete`,
      description: `Successfully deleted leaf node ${target}.`,
      reasoning: 'The tree remains a valid Binary Search Tree.',
      highlightedNodeIds: [],
      deletionCase: 'leaf',
      treeSnapshot: createSnapshot(workingRoot),
    });

    return {
      operation: 'delete',
      targetValue: target,
      success: true,
      steps,
      finalRoot: workingRoot,
      deletionCase: 'leaf',
    };
  }

  // Case 2: One child
  if (deletionCase === 'one-child') {
    const onlyChild = current.left ?? current.right!;
    const childSide: Direction = current.left ? 'left' : 'right';

    steps.push({
      type: 'found',
      title: `Found ${target} — Case 2: One Child`,
      description: `Node ${target} has one ${childSide} child (${onlyChild.value}). Promote ${onlyChild.value} to take its place.`,
      reasoning:
        'Every value in the single child subtree already satisfies the ordering constraints of the deleted node’s parent.',
      comparisonText: `${target} == ${current.value}`,
      nextHint: `Replace ${target} with its ${childSide} child (${onlyChild.value}).`,
      highlightedNodeIds: [...pathIds, onlyChild.id],
      errorNodeId: current.id,
      successorNodeId: onlyChild.id,
      deletionCase: 'one-child',
      treeSnapshot: createSnapshot(workingRoot),
    });

    if (!parent) {
      workingRoot = onlyChild;
    } else if (parentSide === 'left') {
      parent.left = onlyChild;
    } else {
      parent.right = onlyChild;
    }

    steps.push({
      type: 'delete',
      title: `Replaced ${target} with ${onlyChild.value}`,
      description: parent
        ? `Linked parent (${parent.value}) directly to ${onlyChild.value}, bypassing ${target}.`
        : `Promoted ${onlyChild.value} to become the new root.`,
      reasoning:
        'Case 2 deletion bypasses the deleted node in O(1) pointer re-linking once located.',
      highlightedNodeIds: parent ? [parent.id, onlyChild.id] : [onlyChild.id],
      successNodeIds: [onlyChild.id],
      deletionCase: 'one-child',
      treeSnapshot: createSnapshot(workingRoot),
    });

    steps.push({
      type: 'complete',
      title: `Deletion complete`,
      description: `Successfully deleted ${target} (one-child case).`,
      reasoning: 'All BST ordering invariants are preserved.',
      highlightedNodeIds: [onlyChild.id],
      successNodeIds: [onlyChild.id],
      deletionCase: 'one-child',
      treeSnapshot: createSnapshot(workingRoot),
    });

    return {
      operation: 'delete',
      targetValue: target,
      success: true,
      steps,
      finalRoot: workingRoot,
      deletionCase: 'one-child',
    };
  }

  // Case 3: Two children (Inorder Successor Replacement)
  steps.push({
    type: 'found',
    title: `Found ${target} — Case 3: Two Children`,
    description: `Node ${target} has both left (${current.left!.value}) and right (${current.right!.value}) children. We must find its inorder successor.`,
    reasoning:
      'The inorder successor—the smallest value in the right subtree—is larger than everything in the left subtree and smaller than everything else in the right subtree.',
    comparisonText: `${target} == ${current.value}`,
    nextHint: `Move into the right subtree starting at ${current.right!.value}.`,
    highlightedNodeIds: [...pathIds],
    errorNodeId: current.id,
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  // Move into right subtree
  let successorParent: BSTNode = current;
  let successor: BSTNode = current.right!;
  const successorSearchPath = [...pathIds, successor.id];

  steps.push({
    type: 'move',
    title: `Enter right subtree (${successor.value})`,
    description: `Move one step right to ${successor.value}, then go left as far as possible to find the minimum value.`,
    reasoning:
      'The minimum value in a BST subtree is always located at its leftmost node.',
    nextHint: successor.left
      ? `Move left from ${successor.value} to ${successor.left.value}.`
      : `${successor.value} has no left child, so it is the inorder successor.`,
    highlightedNodeIds: [...successorSearchPath],
    errorNodeId: current.id,
    activeNodeId: successor.id,
    direction: 'right',
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  while (successor.left) {
    successorParent = successor;
    successor = successor.left;
    successorSearchPath.push(successor.id);

    steps.push({
      type: 'move',
      title: `Move left to ${successor.value}`,
      description: `Continue moving left to find a smaller value in the right subtree (currently at ${successor.value}).`,
      reasoning: 'Each left edge leads to strictly smaller values within the right subtree.',
      nextHint: successor.left
        ? `Move left from ${successor.value} to ${successor.left.value}.`
        : `${successor.value} has no left child—it is the smallest node here.`,
      highlightedNodeIds: [...successorSearchPath],
      errorNodeId: current.id,
      activeNodeId: successor.id,
      direction: 'left',
      deletionCase: 'two-children',
      treeSnapshot: createSnapshot(workingRoot),
    });
  }

  // Found inorder successor
  const successorValue = successor.value;
  steps.push({
    type: 'found',
    title: `Inorder successor found: ${successorValue}`,
    description: `${successorValue} is the smallest value in ${target}'s right subtree.`,
    reasoning:
      `Because ${successorValue} has no left child, it is guaranteed to be the immediate next value after ${target} in sorted order.`,
    nextHint: `Copy ${successorValue} into node ${target}.`,
    highlightedNodeIds: [...successorSearchPath],
    errorNodeId: current.id,
    successorNodeId: successor.id,
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  // Replace target's value with successor's value
  current.value = successorValue;

  steps.push({
    type: 'replace',
    title: `Replace ${target} with ${successorValue}`,
    description: `Copied the inorder successor's value (${successorValue}) into the target node's position.`,
    reasoning:
      `Now we remove the duplicate ${successorValue} from its original position—which is guaranteed to have at most one (right) child.`,
    nextHint: `Remove the original successor node (${successorValue}).`,
    highlightedNodeIds: [...successorSearchPath],
    successNodeIds: [current.id],
    errorNodeId: successor.id,
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  // Remove successor from its original position
  if (successorParent === current) {
    current.right = successor.right;
  } else {
    successorParent.left = successor.right;
  }

  steps.push({
    type: 'delete',
    title: `Removed original successor node`,
    description: successor.right
      ? `Removed the original ${successorValue} node and promoted its right child (${successor.right.value}).`
      : `Removed the original ${successorValue} leaf node from the right subtree.`,
    reasoning:
      'Since the inorder successor never has a left child, removing it reduces to Case 1 (leaf) or Case 2 (one right child).',
    highlightedNodeIds: [current.id],
    successNodeIds: [current.id],
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  steps.push({
    type: 'complete',
    title: `Deletion complete`,
    description: `Successfully deleted ${target} by replacing it with its inorder successor (${successorValue}).`,
    reasoning:
      'Every node in the left subtree is still < ' +
      `${successorValue}, and every node in the right subtree is still > ${successorValue}.`,
    highlightedNodeIds: [current.id],
    successNodeIds: [current.id],
    deletionCase: 'two-children',
    treeSnapshot: createSnapshot(workingRoot),
  });

  return {
    operation: 'delete',
    targetValue: target,
    success: true,
    steps,
    finalRoot: workingRoot,
    deletionCase: 'two-children',
  };
}
