# BST Quest

An interactive, minimalist educational game for learning **Binary Search Trees (BST)** through step-by-step visualization, active predictions, and progressive challenges.

![React](https://img.shields.io/badge/React-19-2563EB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-0D9488?style=flat-square&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-20_Tests_Passing-16A34A?style=flat-square&logo=vitest&logoColor=white)

---

## Overview

**BST Quest** turns Binary Search Tree algorithms into a hands-on learning experience. Instead of mutating the tree instantaneously, every operation generates an immutable sequence of **tree snapshots** so learners can step backward and forward, scrub a timeline, and read the algorithmic reasoning behind every comparison.

### Core Learning Loop
1. **Receive a task** in Playground or one of four progressive levels.
2. **Predict or perform** a BST operation (insertion, search, deletion, DFS traversal, or Breadth-First Search).
3. **Watch every step** with highlighted comparison paths, synchronized parent-to-child animations, empty-slot previews, and live queue/output displays.
4. **Understand the "Why"** through contextual explanations and Big-O complexity analysis.
5. **Earn XP, streaks, stars, and achievements** saved locally in the browser.

---

## Features

### Pure TypeScript BST Engine
The data structure and algorithms are implemented as pure TypeScript modules independent of React:
- **Insertion** — Root-to-leaf comparison path, empty-child slot preview, and duplicate rejection.
- **Searching** — Step-by-step left/right branching with found and null-termination states.
- **Deletion (All 3 Cases)**:
  - **Case 1 (Leaf Node):** Direct removal.
  - **Case 2 (One Child):** Single-child promotion.
  - **Case 3 (Two Children):** Explicit **Inorder Successor** lookup in the right subtree, value replacement, and original successor removal.
- **DFS Traversals** — Inorder (`Left → Root → Right`), Preorder (`Root → Left → Right`), and Postorder (`Left → Right → Root`) with live output sequences.
- **Breadth-First Search (BFS / Level-Order)** — Level-by-level traversal using a FIFO queue, with a live **BFS Queue** visualizer showing nodes being enqueued and dequeued at each step.
- **Live Validation** — Continuously verifies the strict BST ordering invariant (`left < node < right`).

### Snapshot-Based Visualization & Playback
- Animated SVG tree layout with collision-free positioning, stable `viewBox` framing, and synchronized node/edge motion.
- **Previous / Next**, **Play / Pause**, **Replay**, and **0.5x – 2x** speed controls.
- Interactive **timeline slider** and clickable step dots for direct step skipping.
- Keyboard navigation (`←` and `→`) to step through operations.
- Dedicated **Explanation Panel** showing the active comparison, algorithmic reasoning (*"Why?"*), and next-step hint.

### Game Modes & Progression
- **Playground** — Free experimentation with custom integer sequences, random tree generation, and built-in presets (including a **Skewed / Worst-Case** tree).
- **Level 1 — Build the Tree:** Insert target sequences and observe BST routing.
- **Level 2 — Find the Value:** Predict *Go Left*, *Go Right*, *Found*, or *Not in Tree* at every node.
- **Level 3 — Tree Maintenance:** Classify and execute all three deletion cases.
- **Level 4 — Traversal Challenge:** Click nodes directly on the SVG tree in Inorder, Preorder, Postorder, and **Breadth-First Search (Level-Order)** sequences.
- **Gamification:** XP rewards, prediction streaks, non-punitive hints, 1–3 star ratings, and 7 milestone achievements persisted via `localStorage`.

---

## Time Complexity

| Operation | Average Case (Balanced) | Worst Case (Skewed) | Notes |
| :--- | :---: | :---: | :--- |
| **Search** | `O(log n)` | `O(n)` | Follows one root-to-leaf path |
| **Insertion** | `O(log n)` | `O(n)` | Locates empty slot, links in `O(1)` |
| **Deletion** | `O(log n)` | `O(n)` | Locates target + optional inorder successor |
| **DFS Traversal** | `O(n)` | `O(n)` | Inorder, Preorder, Postorder visit every node once |
| **BFS (Level-Order)** | `O(n)` | `O(n)` | Visits level by level using an `O(w)` FIFO queue |

> A standard BST is not self-balancing. Inserting sorted values (e.g. `10, 20, 30, 40, 50`) produces a skewed tree that degrades to linked-list `O(n)` performance.

---

## Tech Stack

- **Frontend:** React 19, TypeScript 5
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Visualization & Motion:** Custom SVG + Framer Motion + Lucide Icons
- **Testing:** Vitest
- **Persistence:** Browser `localStorage` (no backend required)

---

## Project Structure

```text
src/
├── algorithms/          # Pure TypeScript BST engine, step generators & unit tests
│   ├── bst.ts           # Core tree utilities, presets, random generator, BST validator
│   ├── insertion.ts     # Step-by-step insertion generator
│   ├── searching.ts     # Step-by-step search generator
│   ├── deletion.ts      # Step-by-step deletion generator (all 3 cases)
│   ├── traversal.ts     # Inorder, Preorder, Postorder & BFS (Level-Order) generators
│   └── __tests__/       # Vitest unit test suite (20 tests)
├── components/          # TreeVisualizer, TreeNode, OperationPanel, Playback, Modals
├── game/                # Level definitions, challenges, scoring & achievements
├── hooks/               # usePlayback & useGameProgress
├── types/               # Strict TypeScript interfaces for BST & game state
└── utils/               # Collision-free SVG tree layout & input validation
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Local Development

```bash
git clone [https://github.com/<your-username>/bst-quest.git](https://github.com/ZavenAvagyan/BST_Educational_Platform.git)
cd BST_Educational_Platform
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Scripts

```bash
npm run dev      # Start local development server
npm test         # Run the Vitest unit test suite
npm run build    # Type-check with tsc and build for production
npm run preview  # Preview the production build locally
```

---

## Testing

The BST engine is verified by **20 automated unit tests** covering:
- Inserting into an empty tree and maintaining BST invariants across insertions
- Rejecting duplicate values without mutating tree state
- Verifying intermediate playback snapshots before and after structural changes
- Searching for existing, missing, and empty-tree values
- Deleting a leaf node, a node with only a left or right child, a node with two children (both deep and direct-right-child inorder successors), deleting the root, deleting the only node, and deleting missing values
- Inorder, Preorder, Postorder, and **Breadth-First Search (BFS)** level-order outputs (balanced, asymmetric, empty trees, and FIFO queue state snapshots)
