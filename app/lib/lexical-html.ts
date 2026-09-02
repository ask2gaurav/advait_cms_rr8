/**
 * Minimal Lexical editor-state JSON → HTML renderer for the static export.
 * Pure (no DOM, no `@lexical/headless`) — mirrors `richtext.ts` `blocksToHtml`.
 * Output is sanitized separately in `export.server.ts`.
 */

interface LexNode {
  type: string;
  children?: LexNode[];
  [key: string]: unknown;
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Lexical text format bitmask.
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

const ALIGN_CLASS: Record<string, string> = {
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

/** `class="…"` attribute for an element node's alignment + indent, or "". */
function blockClass(node: LexNode): string {
  const classes: string[] = [];
  const fmt = typeof node.format === "string" ? node.format : "";
  if (ALIGN_CLASS[fmt]) classes.push(ALIGN_CLASS[fmt]);
  const indent = Number(node.indent ?? 0);
  if (indent > 0) classes.push(`rt-indent-${Math.min(indent, 8)}`);
  return classes.length ? ` class="${classes.join(" ")}"` : "";
}

function renderText(node: LexNode): string {
  let html = escapeHtml(String(node.text ?? ""));
  const f = Number(node.format ?? 0);
  if (f & IS_CODE) html = `<code>${html}</code>`;
  if (f & IS_BOLD) html = `<strong>${html}</strong>`;
  if (f & IS_ITALIC) html = `<em>${html}</em>`;
  if (f & IS_UNDERLINE) html = `<u>${html}</u>`;
  if (f & IS_STRIKETHROUGH) html = `<s>${html}</s>`;
  if (f & IS_SUBSCRIPT) html = `<sub>${html}</sub>`;
  if (f & IS_SUPERSCRIPT) html = `<sup>${html}</sup>`;
  return html;
}

function renderChildren(node: LexNode): string {
  return (node.children ?? []).map(renderNode).join("");
}

function renderListItems(node: LexNode): string {
  return (node.children ?? [])
    .map((child) => {
      if (child.type !== "listitem") return renderNode(child);
      // A checklist item / nested list.
      const cls = child.checked === true ? ' class="checked"' : "";
      return `<li${cls}>${renderChildren(child)}</li>`;
    })
    .join("");
}

function renderCode(node: LexNode): string {
  const text = (node.children ?? [])
    .map((c) => (c.type === "linebreak" ? "\n" : escapeHtml(String(c.text ?? ""))))
    .join("");
  return `<pre><code>${text}</code></pre>`;
}

function renderTable(node: LexNode): string {
  const rows = (node.children ?? [])
    .map((row) => {
      if (row.type !== "tablerow") return "";
      const cells = (row.children ?? [])
        .map((cell) => {
          if (cell.type !== "tablecell") return "";
          const tag = Number(cell.headerState ?? 0) & 1 ? "th" : "td";
          return `<${tag}>${renderChildren(cell)}</${tag}>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><tbody>${rows}</tbody></table>`;
}

function renderNode(node: LexNode): string {
  switch (node.type) {
    case "text":
      return renderText(node);
    case "linebreak":
      return "<br>";
    case "tab":
      return " ";
    case "paragraph": {
      const inner = renderChildren(node);
      return inner ? `<p${blockClass(node)}>${inner}</p>` : "<p></p>";
    }
    case "heading": {
      const tag = /^h[1-6]$/.test(String(node.tag)) ? String(node.tag) : "h2";
      return `<${tag}${blockClass(node)}>${renderChildren(node)}</${tag}>`;
    }
    case "quote":
      return `<blockquote${blockClass(node)}>${renderChildren(node)}</blockquote>`;
    case "list": {
      const listType = String(node.listType ?? "bullet");
      if (listType === "number") return `<ol>${renderListItems(node)}</ol>`;
      if (listType === "check")
        return `<ul class="checklist">${renderListItems(node)}</ul>`;
      return `<ul>${renderListItems(node)}</ul>`;
    }
    case "listitem":
      return `<li>${renderChildren(node)}</li>`;
    case "link":
    case "autolink": {
      const href = escapeHtml(String(node.url ?? "#"));
      const target =
        node.target === "_blank"
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
      return `<a href="${href}"${target}>${renderChildren(node)}</a>`;
    }
    case "code":
      return renderCode(node);
    case "horizontalrule":
      return "<hr>";
    case "table":
      return renderTable(node);
    case "image": {
      const src = escapeHtml(String(node.src ?? ""));
      const alt = escapeHtml(String(node.altText ?? ""));
      const caption = escapeHtml(String(node.caption ?? ""));
      if (!src) return "";
      return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${
        caption ? `<figcaption>${caption}</figcaption>` : ""
      }</figure>`;
    }
    default:
      // Unknown node: emit its children so nothing is silently dropped.
      return renderChildren(node);
  }
}

/** Convert a stored Lexical editor state (`{ root: … }`) to an HTML string. */
export function lexicalToHtml(state: unknown): string {
  if (!state || typeof state !== "object") return "";
  const root = (state as { root?: LexNode }).root;
  if (!root || !Array.isArray(root.children)) return "";
  return root.children.map(renderNode).join("");
}
