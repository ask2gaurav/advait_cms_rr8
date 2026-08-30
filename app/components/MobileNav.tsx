import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { X } from "lucide-react";
import { CTALink } from "~/components/ui/CTALink";
import { ThemeToggle } from "~/components/theme-toggle";
import { cn } from "~/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

/** Accessible slide-over navigation for small screens. */
export function MobileNav({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn("md:hidden", open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "fixed inset-0 z-40 h-dvh bg-gray-950/40 transition-opacity motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-80 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200 motion-reduce:transition-none dark:bg-gray-900",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <span className="text-sm font-semibold">Menu</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2.5 text-base font-medium",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <CTALink href="/contact" variant="brand" size="lg" className="w-full">
            Start a Project
          </CTALink>
          <Link
            to="/"
            onClick={onClose}
            className="mt-3 block text-center text-xs text-gray-400"
          >
            Advait Solutions
          </Link>
        </div>
      </div>
    </div>
  );
}
