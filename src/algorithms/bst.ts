import type { BSTNode, TreeSnapshot } from '../types/bst.types';

let idCounter = 0;

export function createNode(value: number, id?: string): BSTNode {
  idCounter += 1;
  return {
    id: id ?? `node-${value}-${idCounter}`,
    value,
    left: null,
    right: null,
  };
}

export function cloneTree(node: BSTNode | null): BSTNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

export function createSnapshot(root: BSTNode | null): TreeSnapshot {
  return { root: cloneTree(root) };
}

/**
 * Inserts a value without generating visualization steps (used for building presets / random trees).
 * Rejects duplicates by returning the tree unchanged.
 */
export function insertValueDirect(root: BSTNode | null, value: number): BSTNode {
  const cloned = cloneTree(root);
  if (!cloned) {
    return createNode(value);
  }

  let current = cloned;
  while (true) {
    if (value === current.value) {
      return cloned;
    }
    if (value < current.value) {
      if (!current.left) {
        current.left = createNode(value);
        return cloned;
      }
      current = current.left;
    } else {
      if (!current.right) {
        current.right = createNode(value);
        return cloned;
      }
      current = current.right;
    }
  }
}

export function buildTreeFromValues(values: number[]): BSTNode | null {
  let root: BSTNode | null = null;
  for (const val of values) {
    if (Number.isInteger(val)) {
      root = insertValueDirect(root, val);
    }
  }
  return root;
}

export function containsValue(root: BSTNode | null, value: number): boolean {
  let current = root;
  while (current) {
    if (value === current.value) return true;
    current = value < current.value ? current.left : current.right;
  }
  return false;
}

export function countNodes(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

export function getTreeHeight(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
}

export function getInorderValues(root: BSTNode | null): number[] {
  const result: number[] = [];
  function walk(node: BSTNode | null) {
    if (!node) return;
    walk(node.left);
    result.push(node.value);
    walk(node.right);
  }
  walk(root);
  return result;
}

/**
 * Strictly validates the Binary Search Tree property:
 * every node in left subtree < node.value < every node in right subtree,
 * with no duplicate values.
 */
export function isValidBST(
  node: BSTNode | null,
  min: number = -Infinity,
  max: number = Infinity
): boolean {
  if (!node) return true;
  if (node.value <= min || node.value >= max) return false;
  return (
    isValidBST(node.left, min, node.value) &&
    isValidBST(node.right, node.value, max)
  );
}

/**
 * Generates a list of unique integers that creates a reasonably structured random BST.
 */
export function generateRandomValues(count = 7, min = 5, max = 95): number[] {
  const clampedCount = Math.max(3, Math.min(count, max - min + 1, 15));
  const set = new Set<number>();
  // Pick a mid-range root first so random trees look balanced more often
  const rootCandidate = Math.floor((min + max) / 2) + Math.floor(Math.random() * 15 - 7);
  set.add(Math.max(min, Math.min(max, rootCandidate)));

  while (set.size < clampedCount) {
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    set.add(val);
  }
  return Array.from(set);
}

export interface TreePreset {
  id: string;
  name: string;
  description: string;
  values: number[];
}

export const TREE_PRESETS: TreePreset[] = [
  {
    id: 'balanced-classic',
    name: 'Classic Balanced',
    description: 'Great for exploring all operations (40, 20, 60, 10, 30, 50, 70)',
    values: [40, 20, 60, 10, 30, 50, 70],
  },
  {
    id: 'deletion-lab',
    name: 'Deletion Lab',
    description: 'Includes leaf, one-child, and two-children cases',
    values: [50, 30, 70, 20, 40, 60, 80, 35, 65],
  },
  {
    id: 'right-skewed',
    name: 'Skewed (Worst Case)',
    description: 'Sorted input degrades BST to O(n) linked list',
    values: [10, 20, 30, 40, 50],
  },
  {
    id: 'starter-five',
    name: 'Spec Example',
    description: '40, 20, 60, 10, 30',
    values: [40, 20, 60, 10, 30],
  },
];
