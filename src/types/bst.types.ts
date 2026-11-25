export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface TreeSnapshot {
  root: BSTNode | null;
}

export type Direction = 'left' | 'right';

export type OperationType = 'insert' | 'search' | 'delete' | 'traversal';

export type TraversalOrder = 'inorder' | 'preorder' | 'postorder' | 'bfs';

export type DeletionCase = 'leaf' | 'one-child' | 'two-children';

export type StepType =
  | 'start'
  | 'compare'
  | 'move'
  | 'insert'
  | 'delete'
  | 'replace'
  | 'found'
  | 'not-found'
  | 'visit'
  | 'error'
  | 'complete';

export interface EmptySlotHighlight {
  parentId: string | null; // null means empty root slot
  direction?: Direction;
  label?: string;
}

export interface OperationStep {
  type: StepType;
  title: string;
  description: string;
  reasoning: string;
  comparisonText?: string;
  nextHint?: string;
  highlightedNodeIds: string[];
  activeNodeId?: string;
  successNodeIds?: string[];
  errorNodeId?: string;
  successorNodeId?: string;
  direction?: Direction;
  emptySlot?: EmptySlotHighlight;
  traversalOutput?: number[];
  queueValues?: number[];
  deletionCase?: DeletionCase;
  treeSnapshot: TreeSnapshot;
}

export interface OperationResult {
  operation: OperationType;
  traversalOrder?: TraversalOrder;
  targetValue?: number;
  success: boolean;
  steps: OperationStep[];
  finalRoot: BSTNode | null;
  traversalSequence?: number[];
  deletionCase?: DeletionCase;
  errorMessage?: string;
}

export interface PositionedNode {
  id: string;
  value: number;
  x: number;
  y: number;
  depth: number;
  parentId: string | null;
  side: Direction | 'root';
}

export interface TreeEdge {
  id: string;
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  side: Direction;
}

export interface TreeLayoutResult {
  nodes: PositionedNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
  nodeMap: Record<string, PositionedNode>;
}
