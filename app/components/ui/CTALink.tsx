import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants, type ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function isExternal(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

/** A call-to-action styled like a Button. Picks <Link> or <a> from the href. */
export function CTALink({
  href,
  children,
  variant = "brand",
  size = "lg",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
        {newTab && <ArrowUpRight className="h-4 w-4" aria-hidden />}
      </a>
    );
  }
  return (
    <Link to={href} className={classes}>
      {children}
    </Link>
  );
}
