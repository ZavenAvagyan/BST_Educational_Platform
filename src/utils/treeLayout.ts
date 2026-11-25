import type {
  BSTNode,
  Direction,
  PositionedNode,
  TreeEdge,
  TreeLayoutResult,
} from '../types/bst.types';

const LEVEL_HEIGHT = 86;
const PADDING_X = 64;
const PADDING_Y = 54;
const MIN_HORIZONTAL_GAP = 64;

/**
 * Computes clean, non-overlapping (x, y) coordinates for every node in the BST.
 * Uses an inorder-column assignment blended with parent-child structure so:
 * 1. Left children are always strictly left of their parent.
 * 2. Right children are always strictly right of their parent.
 * 3. Siblings and subtrees never collide, even on skewed or deep trees.
 */
export function computeTreeLayout(root: BSTNode | null): TreeLayoutResult {
  if (!root) {
    return {
      nodes: [],
      edges: [],
      width: 640,
      height: 360,
      nodeMap: {},
    };
  }

  const nodes: PositionedNode[] = [];
  const edges: TreeEdge[] = [];
  const nodeMap: Record<string, PositionedNode> = {};

  // Step 1: Assign inorder horizontal index (0..n-1) and depth
  let columnIndex = 0;
  let maxDepth = 0;

  interface TempPos {
    node: BSTNode;
    col: number;
    depth: number;
    parentId: string | null;
    side: Direction | 'root';
  }

  const tempPositions: TempPos[] = [];

  function assignInorder(
    node: BSTNode | null,
    depth: number,
    parentId: string | null,
    side: Direction | 'root'
  ) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    assignInorder(node.left, depth + 1, node.id, 'left');
    tempPositions.push({
      node,
      col: columnIndex,
      depth,
      parentId,
      side,
    });
    columnIndex += 1;
    assignInorder(node.right, depth + 1, node.id, 'right');
  }

  assignInorder(root, 0, null, 'root');

  const totalCols = Math.max(1, columnIndex);
  const contentWidth = Math.max(520, (totalCols - 1) * MIN_HORIZONTAL_GAP + PADDING_X * 2);
  const contentHeight = Math.max(320, maxDepth * LEVEL_HEIGHT + PADDING_Y * 2 + 40);

  // Center the tree horizontally inside contentWidth
  const usedSpan = (totalCols - 1) * MIN_HORIZONTAL_GAP;
  const startX = (contentWidth - usedSpan) / 2;

  for (const item of tempPositions) {
    const positioned: PositionedNode = {
      id: item.node.id,
      value: item.node.value,
      x: startX + item.col * MIN_HORIZONTAL_GAP,
      y: PADDING_Y + item.depth * LEVEL_HEIGHT,
      depth: item.depth,
      parentId: item.parentId,
      side: item.side,
    };
    nodes.push(positioned);
    nodeMap[positioned.id] = positioned;
  }

  for (const positioned of nodes) {
    if (positioned.parentId && positioned.side !== 'root') {
      const parent = nodeMap[positioned.parentId];
      if (parent) {
        edges.push({
          id: `${parent.id}->${positioned.id}`,
          fromId: parent.id,
          toId: positioned.id,
          x1: parent.x,
          y1: parent.y,
          x2: positioned.x,
          y2: positioned.y,
          side: positioned.side,
        });
      }
    }
  }

  return {
    nodes,
    edges,
    width: contentWidth,
    height: contentHeight,
    nodeMap,
  };
}

/**
 * Calculates a clean visual coordinate for an empty child slot (used when
 * explaining insertion or null search termination).
 */
export function computeEmptySlotPosition(
  layout: TreeLayoutResult,
  parentId: string | null,
  direction?: Direction
): { x: number; y: number; fromX?: number; fromY?: number } {
  if (!parentId) {
    return { x: layout.width / 2, y: PADDING_Y };
  }
  const parent = layout.nodeMap[parentId];
  if (!parent) {
    return { x: layout.width / 2, y: PADDING_Y };
  }
  const offset = Math.max(46, MIN_HORIZONTAL_GAP * 0.85);
  const dx = direction === 'left' ? -offset : offset;
  return {
    x: parent.x + dx,
    y: parent.y + LEVEL_HEIGHT,
    fromX: parent.x,
    fromY: parent.y,
  };
}
