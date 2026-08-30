import { useId } from "react";
import { cn } from "~/lib/utils";

/**
 * Decorative node-and-edge network. Pure inline SVG, no network, theme-aware
 * via currentColor. Deterministic layout so SSR and client match.
 */
const NODES: [number, number][] = [
  [60, 80], [180, 40], [300, 120], [430, 60], [560, 140], [690, 70],
  [120, 200], [260, 260], [400, 210], [540, 280], [660, 220], [760, 300],
  [80, 340], [220, 400], [360, 350], [500, 410], [640, 360], [740, 430],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 7], [2, 8], [3, 9],
  [4, 10], [5, 11], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [6, 12],
  [7, 13], [8, 14], [9, 15], [10, 16], [11, 17], [12, 13], [13, 14],
  [14, 15], [15, 16], [16, 17],
];

export function NeuralMesh({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 460"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-brand-500/40 dark:text-brand-400/25",
        className,
      )}
    >
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="460" fill={`url(#glow-${id})`} opacity="0.35" />
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 4 : 2.5} />
        ))}
      </g>
    </svg>
  );
}
