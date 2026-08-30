import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/** Small pill for tags, meta chips, trust indicators. */
export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "brand" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" &&
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        variant === "brand" &&
          "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
        variant === "outline" &&
          "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400",
        className,
      )}
    >
      {children}
    </span>
  );
}
