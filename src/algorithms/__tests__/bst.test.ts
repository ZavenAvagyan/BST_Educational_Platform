import { describe, expect, it } from 'vitest';
import {
  buildTreeFromValues,
  containsValue,
  countNodes,
  getInorderValues,
  isValidBST,
} from '../bst';
import { insertWithSteps } from '../insertion';
import { searchWithSteps } from '../searching';
import { deleteWithSteps } from '../deletion';
import { traverseWithSteps } from '../traversal';

describe('BST Engine & Step Generator', () => {
  describe('Insertion', () => {
    it('inserts into an empty tree and generates valid snapshots', () => {
      const res = insertWithSteps(null, 40);
      expect(res.success).toBe(true);
      expect(res.finalRoot?.value).toBe(40);
      expect(isValidBST(res.finalRoot)).toBe(true);
      expect(res.steps[0].treeSnapshot.root).toBeNull();
      expect(res.steps[res.steps.length - 1].treeSnapshot.root?.value).toBe(40);
    });

    it('inserts smaller and larger values preserving the BST property', () => {
      let root = null;
      for (const val of [40, 20, 60, 10, 30, 50, 70]) {
        const res = insertWithSteps(root, val);
        expect(res.success).toBe(true);
        root = res.finalRoot;
        expect(isValidBST(root)).toBe(true);
      }
      expect(getInorderValues(root)).toEqual([10, 20, 30, 40, 50, 60, 70]);
      expect(countNodes(root)).toBe(7);
    });

    it('rejects duplicate values without mutating the tree', () => {
      const root = buildTreeFromValues([40, 20, 60, 10, 30]);
      const res = insertWithSteps(root, 30);
      expect(res.success).toBe(false);
      expect(res.steps[res.steps.length - 1].type).toBe('error');
      expect(getInorderValues(res.finalRoot)).toEqual([10, 20, 30, 40, 60]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('records accurate intermediate snapshots before and after insertion', () => {
      const root = buildTreeFromValues([40, 20]);
      const res = insertWithSteps(root, 30);
      expect(res.success).toBe(true);
      // Before the insert step, 30 should not yet exist in the snapshot
      const insertStepIdx = res.steps.findIndex((s) => s.type === 'insert');
      expect(insertStepIdx).toBeGreaterThan(0);
      expect(containsValue(res.steps[insertStepIdx - 1].treeSnapshot.root, 30)).toBe(false);
      expect(containsValue(res.steps[insertStepIdx].treeSnapshot.root, 30)).toBe(true);
    });
  });

  describe('Searching', () => {
    const root = buildTreeFromValues([40, 20, 60, 10, 30, 50, 70]);

    it('finds an existing value and highlights the comparison path', () => {
      const res = searchWithSteps(root, 30);
      expect(res.success).toBe(true);
      const last = res.steps[res.steps.length - 1];
      expect(last.type).toBe('found');
      expect(last.highlightedNodeIds.length).toBe(3); // 40 -> 20 -> 30
    });

    it('reports not-found for a missing value', () => {
      const res = searchWithSteps(root, 35);
      expect(res.success).toBe(false);
      expect(res.steps[res.steps.length - 1].type).toBe('not-found');
    });

    it('handles searching an empty tree', () => {
      const res = searchWithSteps(null, 10);
      expect(res.success).toBe(false);
      expect(res.steps[0].type).toBe('not-found');
    });
  });

  describe('Deletion', () => {
    it('deletes a leaf node (Case 1)', () => {
      const root = buildTreeFromValues([40, 20, 60, 10, 30]);
      const res = deleteWithSteps(root, 10);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('leaf');
      expect(getInorderValues(res.finalRoot)).toEqual([20, 30, 40, 60]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('deletes a node with only a left child (Case 2)', () => {
      const root = buildTreeFromValues([40, 20, 60, 10]);
      const res = deleteWithSteps(root, 20);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('one-child');
      expect(getInorderValues(res.finalRoot)).toEqual([10, 40, 60]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('deletes a node with only a right child (Case 2)', () => {
      const root = buildTreeFromValues([40, 20, 60, 30]);
      const res = deleteWithSteps(root, 20);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('one-child');
      expect(getInorderValues(res.finalRoot)).toEqual([30, 40, 60]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('deletes a node with two children using inorder successor (Case 3)', () => {
      const root = buildTreeFromValues([50, 30, 70, 20, 40, 60, 80, 35, 65]);
      const res = deleteWithSteps(root, 50);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('two-children');
      expect(res.finalRoot?.value).toBe(60); // inorder successor of 50 is 60, which had right child 65
      expect(getInorderValues(res.finalRoot)).toEqual([20, 30, 35, 40, 60, 65, 70, 80]);
      expect(isValidBST(res.finalRoot)).toBe(true);
      // Verify step-by-step replace snapshot exists
      expect(res.steps.some((s) => s.type === 'replace')).toBe(true);
    });

    it('deletes a node with two children when successor is direct right child', () => {
      const root = buildTreeFromValues([40, 20, 60, 10, 30]);
      const res = deleteWithSteps(root, 40);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('two-children');
      expect(res.finalRoot?.value).toBe(60);
      expect(getInorderValues(res.finalRoot)).toEqual([10, 20, 30, 60]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('deletes the root when it has only one child', () => {
      const root = buildTreeFromValues([40, 20, 10]);
      const res = deleteWithSteps(root, 40);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('one-child');
      expect(res.finalRoot?.value).toBe(20);
      expect(getInorderValues(res.finalRoot)).toEqual([10, 20]);
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('deletes the only node in the tree', () => {
      const root = buildTreeFromValues([40]);
      const res = deleteWithSteps(root, 40);
      expect(res.success).toBe(true);
      expect(res.deletionCase).toBe('leaf');
      expect(res.finalRoot).toBeNull();
      expect(isValidBST(res.finalRoot)).toBe(true);
    });

    it('returns not-found when deleting a missing value', () => {
      const root = buildTreeFromValues([40, 20, 60]);
      const res = deleteWithSteps(root, 99);
      expect(res.success).toBe(false);
      expect(res.steps[res.steps.length - 1].type).toBe('not-found');
      expect(getInorderValues(res.finalRoot)).toEqual([20, 40, 60]);
    });
  });

  describe('Traversals', () => {
    const root = buildTreeFromValues([40, 20, 60, 10, 30, 50, 70]);

    it('produces sorted order for inorder traversal', () => {
      const res = traverseWithSteps(root, 'inorder');
      expect(res.traversalSequence).toEqual([10, 20, 30, 40, 50, 60, 70]);
    });

    it('produces Root -> Left -> Right for preorder traversal', () => {
      const res = traverseWithSteps(root, 'preorder');
      expect(res.traversalSequence).toEqual([40, 20, 10, 30, 60, 50, 70]);
    });

    it('produces Left -> Right -> Root for postorder traversal', () => {
      const res = traverseWithSteps(root, 'postorder');
      expect(res.traversalSequence).toEqual([10, 30, 20, 50, 70, 60, 40]);
    });

    it('produces level-order sequence for breadth-first search (BFS)', () => {
      const res = traverseWithSteps(root, 'bfs');
      expect(res.traversalSequence).toEqual([40, 20, 60, 10, 30, 50, 70]);
      // Start step should have root in queue
      expect(res.steps[0].queueValues).toEqual([40]);
      // After visiting 40, queue should contain [20, 60]
      expect(res.steps[1].queueValues).toEqual([20, 60]);
      // Final step should have an empty queue
      expect(res.steps[res.steps.length - 1].queueValues).toEqual([]);
    });

    it('handles BFS on an asymmetric tree and an empty tree', () => {
      const asym = buildTreeFromValues([50, 30, 70, 20, 40, 60, 80, 35, 65]);
      expect(traverseWithSteps(asym, 'bfs').traversalSequence).toEqual([
        50, 30, 70, 20, 40, 60, 80, 35, 65,
      ]);
      const empty = traverseWithSteps(null, 'bfs');
      expect(empty.traversalSequence).toEqual([]);
      expect(empty.steps[0].queueValues).toEqual([]);
    });
  });
});
