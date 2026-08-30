import { useEffect, useRef } from "react";

/**
 * Giscus (GitHub Discussions) comments. Renders nothing until the settings
 * provide `integrations.giscus` config. Runs entirely client-side, so it stays
 * out of the prerendered HTML.
 */
export function Giscus({ config }: { config?: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !config?.repo || !config?.repoId) return;
    el.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    const attrs: Record<string, string> = {
      "data-repo": config.repo,
      "data-repo-id": config.repoId,
      "data-category": config.category ?? "General",
      "data-category-id": config.categoryId ?? "",
      "data-mapping": config.mapping ?? "pathname",
      "data-reactions-enabled": "1",
      "data-theme": "preferred_color_scheme",
      "data-loading": "lazy",
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    el.appendChild(s);
  }, [config]);

  if (!config?.repo) return null;
  return <div ref={ref} className="mt-16" />;
}
