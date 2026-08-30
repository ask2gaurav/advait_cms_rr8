import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "~/lib/utils";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Light/dark toggle. Persists an explicit choice in localStorage["theme"]. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={mounted ? theme === "dark" : undefined}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        className,
      )}
    >
      <Sun className="h-5 w-5 dark:hidden" aria-hidden />
      <Moon className="hidden h-5 w-5 dark:block" aria-hidden />
    </button>
  );
}
