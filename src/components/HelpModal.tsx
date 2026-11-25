import { X } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">How BST Quest Works</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <h3 className="font-semibold text-slate-900 mb-1">
              The Binary Search Tree Property
            </h3>
            <p>
              For every node in a BST, all values in its <strong>left subtree</strong> are
              strictly smaller, and all values in its <strong>right subtree</strong> are
              strictly greater.
            </p>
          </div>

          <ul className="space-y-2 list-disc pl-4">
            <li>
              <strong className="text-slate-800">Playground:</strong> Freely insert,
              search, delete, or traverse any unique integer BST. Build from custom
              sequences, load presets, or click any node to pre-fill its value.
            </li>
            <li>
              <strong className="text-slate-800">Step-by-Step Playback:</strong> Every
              operation generates an immutable sequence of tree snapshots. Use{' '}
              <strong>Prev / Next</strong>, <strong>Play / Pause</strong>, speed controls,
              or the <strong>timeline slider</strong> to inspect any intermediate state.
            </li>
            <li>
              <strong className="text-slate-800">4 Progressive Levels:</strong> Master
              Insertion (Level 1), Search Path Prediction (Level 2), All 3 Deletion Cases
              including Inorder Successor (Level 3), and Traversals (Level 4).
            </li>
            <li>
              <strong className="text-slate-800">Keyboard Shortcuts:</strong> Use{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">
                ←
              </kbd>{' '}
              and{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">
                →
              </kbd>{' '}
              to step backward and forward through the current operation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
