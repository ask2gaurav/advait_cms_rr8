import { useId } from "react";
import { cn } from "~/lib/utils";

/** Subtle dotted grid. Inline SVG pattern, decorative, theme-aware. */
export function GridMotif({
  className,
  variant = "dots",
}: {
  className?: string;
  variant?: "dots" | "lines";
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-gray-900/[0.05] dark:text-white/[0.06]",
        className,
      )}
    >
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          {variant === "dots" ? (
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          ) : (
            <path
              d="M32 0H0V32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
