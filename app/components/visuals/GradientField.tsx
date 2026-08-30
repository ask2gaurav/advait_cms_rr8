import { cn } from "~/lib/utils";

/** Soft layered gradient blobs. CSS only, theme-aware, decorative. */
export function GradientField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
      <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-300/10 blur-3xl dark:bg-brand-400/5" />
    </div>
  );
}
