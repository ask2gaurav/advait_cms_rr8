import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

/** Eyebrow + heading + optional lead, with an optional right-aligned link. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  level = 2,
  align = "left",
  link,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  level?: 1 | 2 | 3;
  align?: "left" | "center";
  link?: { to: string; label: string };
  className?: string;
}) {
  const H = `h${level}` as const;
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        link && "sm:flex-row sm:items-end sm:justify-between sm:text-left",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        )}
        <H
          className={cn(
            "font-semibold tracking-tight text-gray-900 dark:text-white",
            level === 1 && "text-4xl sm:text-5xl",
            level === 2 && "text-3xl sm:text-4xl",
            level === 3 && "text-2xl",
          )}
        >
          {title}
        </H>
        {lead && (
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{lead}</p>
        )}
      </div>
      {link && (
        <Link
          to={link.to}
          className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}
