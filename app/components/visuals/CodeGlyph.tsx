import { cn } from "~/lib/utils";

/** Stylised code + flow motif for the AI capabilities strip. Decorative. */
export function CodeGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={cn("pointer-events-none text-brand-500/30 dark:text-brand-400/25", className)}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M70 60 40 100 70 140" />
        <path d="M130 60 160 100 130 140" />
        <path d="M108 46 92 154" opacity="0.6" />
      </g>
      <g fill="currentColor" opacity="0.5">
        <circle cx="40" cy="100" r="6" />
        <circle cx="160" cy="100" r="6" />
      </g>
    </svg>
  );
}
