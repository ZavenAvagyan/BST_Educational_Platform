import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ComplexityModalProps {
  open: boolean;
  onClose: () => void;
}

const ROWS = [
  { op: 'Search', avg: 'O(log n)', worst: 'O(n)', note: 'Follows one root-to-leaf path' },
  { op: 'Insertion', avg: 'O(log n)', worst: 'O(n)', note: 'Searches for null slot, then links in O(1)' },
  { op: 'Deletion', avg: 'O(log n)', worst: 'O(n)', note: 'Locates target + optional inorder successor' },
  { op: 'DFS Traversal', avg: 'O(n)', worst: 'O(n)', note: 'Inorder, Preorder, Postorder visit every node once' },
  { op: 'BFS (Level-Order)', avg: 'O(n)', worst: 'O(n)', note: 'Visits level by level using an O(w) FIFO queue' },
];

export function ComplexityModal({ open, onClose }: ComplexityModalProps) {
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
          <div>
            <h2 className="text-base font-bold text-slate-900">
              BST Time Complexity & Balance
            </h2>
            <p className="text-xs text-slate-500">
              How tree shape directly impacts algorithmic performance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5 font-semibold">Operation</th>
                <th className="px-3.5 py-2.5 font-semibold">Average Case</th>
                <th className="px-3.5 py-2.5 font-semibold">Worst Case</th>
                <th className="px-3.5 py-2.5 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((row) => (
                <tr key={row.op} className="bg-white">
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800">{row.op}</td>
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-[#0D9488]">
                    {row.avg}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-[#D97706]">
                    {row.worst}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              Balanced Tree — O(log n)
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              When values are distributed evenly, each comparison discards roughly half of
              the remaining nodes.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              Skewed Tree — O(n)
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              A standard BST is not self-balancing. Inserting sorted values (10, 20, 30, 40,
              50) creates a chain that behaves like a linked list! Try the{' '}
              <strong>Skewed (Worst Case)</strong> preset to see it in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
