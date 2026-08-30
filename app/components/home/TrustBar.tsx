import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import type { TrustItem } from "~/lib/site-content";

export function TrustBar({
  items,
  className,
}: {
  items: readonly TrustItem[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600 dark:text-gray-400",
        className,
      )}
    >
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-brand-500" aria-hidden />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
