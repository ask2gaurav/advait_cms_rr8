import type { ElementType, ReactNode } from "react";
import { cn } from "~/lib/utils";

export { Container } from "~/components/site";

type Bg = "default" | "mist" | "ink";

const BG: Record<Bg, string> = {
  default: "bg-white dark:bg-gray-950",
  mist: "bg-mist dark:bg-gray-900/40",
  ink: "bg-charcoal text-gray-100 dark:bg-black",
};

/** Vertical-rhythm section wrapper. `cmsSection` emits `data-cms-section`. */
export function Section({
  as: As = "section",
  bg = "default",
  spacing = "default",
  id,
  cmsSection,
  className,
  children,
}: {
  as?: ElementType;
  bg?: Bg;
  spacing?: "default" | "compact" | "loose" | "compact-case-study";
  id?: string;
  cmsSection?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <As
      id={id}
      data-cms-section={cmsSection}
      className={cn(
        "relative",
        spacing === "compact-case-study" && "py-2 sm:py-6",
        spacing === "compact" && "py-12 sm:py-16",
        spacing === "default" && "py-16 sm:py-24",
        spacing === "loose" && "py-20 sm:py-32",
        BG[bg],
        className,
      )}
    >
      {children}
    </As>
  );
}
