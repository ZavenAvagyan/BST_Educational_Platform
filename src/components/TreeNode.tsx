import { motion } from 'framer-motion';

export type NodeVisualState =
  | 'default'
  | 'active'
  | 'path'
  | 'success'
  | 'error'
  | 'successor'
  | 'predicted';

export const TREE_MOTION_TRANSITION = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1] as const,
};

interface TreeNodeProps {
  id: string;
  value: number;
  x: number;
  y: number;
  spawnX?: number;
  spawnY?: number;
  state: NodeVisualState;
  badgeText?: string;
  clickable?: boolean;
  onClick?: (value: number, id: string) => void;
}

const STATE_STYLES: Record<
  NodeVisualState,
  { fill: string; stroke: string; text: string; ring?: string }
> = {
  default: {
    fill: '#FFFFFF',
    stroke: '#CBD5E1',
    text: '#334155',
  },
  path: {
    fill: '#EFF6FF',
    stroke: '#2563EB',
    text: '#1D4ED8',
  },
  active: {
    fill: '#FEF3C7',
    stroke: '#D97706',
    text: '#92400E',
    ring: '#F59E0B',
  },
  success: {
    fill: '#CCFBF1',
    stroke: '#0D9488',
    text: '#115E59',
    ring: '#14B8A6',
  },
  error: {
    fill: '#FEE2E2',
    stroke: '#DC2626',
    text: '#991B1B',
    ring: '#EF4444',
  },
  successor: {
    fill: '#DBEAFE',
    stroke: '#2563EB',
    text: '#1E40AF',
    ring: '#3B82F6',
  },
  predicted: {
    fill: '#CCFBF1',
    stroke: '#0D9488',
    text: '#115E59',
  },
};

export function TreeNode({
  value,
  x,
  y,
  spawnX,
  spawnY,
  state,
  badgeText,
  clickable = false,
  onClick,
}: TreeNodeProps) {
  const style = STATE_STYLES[state];
  const radius = 24;
  const startX = spawnX ?? x;
  const startY = spawnY ?? y;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4, x: startX, y: startY }}
      animate={{
        opacity: 1,
        scale: state === 'active' ? 1.08 : 1,
        x,
        y,
      }}
      exit={{ opacity: 0, scale: 0.35 }}
      transition={TREE_MOTION_TRANSITION}
      onClick={() => clickable && onClick?.(value, String(value))}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      role={clickable ? 'button' : undefined}
      aria-label={`Node ${value}`}
    >
      {/* Subtle outer pulse ring for active/success/error/successor states */}
      {style.ring && (
        <motion.circle
          r={radius + 6}
          fill="none"
          stroke={style.ring}
          strokeWidth={2}
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.07, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Opaque white backing so connecting edges never bleed through */}
      <circle r={radius} fill="#FFFFFF" />

      {/* Main node circle */}
      <circle
        r={radius}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={state === 'default' ? 2 : 2.75}
        className="transition-colors duration-200"
      />

      {/* Node integer value */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.text}
        fontSize={15}
        fontWeight={600}
        fontFamily="var(--font-mono)"
        className="select-none pointer-events-none"
      >
        {value}
      </text>

      {/* Optional mini badge (e.g., visit order #) */}
      {badgeText && (
        <g transform={`translate(${radius - 4}, ${-radius + 4})`}>
          <rect x={-11} y={-10} width={22} height={18} rx={9} fill="#0D9488" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y={-1}
            fill="#FFFFFF"
            fontSize={10}
            fontWeight={700}
            fontFamily="var(--font-mono)"
            className="select-none pointer-events-none"
          >
            {badgeText}
          </text>
        </g>
      )}
    </motion.g>
  );
}
