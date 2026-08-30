/**
 * Minimal BlockNote JSON → HTML renderer for the static export.
 * Covers the default block/inline types. Output is sanitized separately.
 */

interface StyledText {
  type: "text";
  text: string;
  styles?: Record<string, boolean | string>;
}
interface LinkInline {
  type: "link";
  href: string;
  content: StyledText[];
}
type Inline = StyledText | LinkInline;

interface Block {
  type: string;
  props?: Record<string, unknown>;
  content?: Inline[] | unknown;
  children?: Block[];
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderInline(nodes: Inline[] | unknown): string {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((n) => {
      if (n.type === "link") {
        const href = escapeHtml(String(n.href ?? "#"));
        return `<a href="${href}">${renderInline(n.content)}</a>`;
      }
      let html = escapeHtml(String(n.text ?? ""));
      const s = n.styles ?? {};
      if (s.bold) html = `<strong>${html}</strong>`;
      if (s.italic) html = `<em>${html}</em>`;
      if (s.underline) html = `<u>${html}</u>`;
      if (s.strike) html = `<s>${html}</s>`;
      if (s.code) html = `<code>${html}</code>`;
      return html;
    })
    .join("");
}

function renderBlock(block: Block): string {
  const inner = renderInline(block.content);
  const kids = block.children?.length ? renderBlocks(block.children) : "";
  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(Number(block.props?.level ?? 2), 1), 6);
      return `<h${level}>${inner}</h${level}>${kids}`;
    }
    case "quote":
      return `<blockquote>${inner}</blockquote>${kids}`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(
        Array.isArray(block.content)
          ? block.content.map((c) => ("text" in c ? c.text : "")).join("")
          : "",
      )}</code></pre>`;
    case "image": {
      const url = escapeHtml(String(block.props?.url ?? ""));
      const caption = escapeHtml(String(block.props?.caption ?? ""));
      return url
        ? `<figure><img src="${url}" alt="${caption}" loading="lazy" />${
            caption ? `<figcaption>${caption}</figcaption>` : ""
          }</figure>`
        : "";
    }
    case "bulletListItem":
    case "numberedListItem":
    case "checkListItem":
      return `<li>${inner}${kids}</li>`;
    case "paragraph":
    default:
      return inner ? `<p>${inner}</p>${kids}` : kids;
  }
}

const LIST_WRAP: Record<string, [string, string]> = {
  bulletListItem: ["<ul>", "</ul>"],
  numberedListItem: ["<ol>", "</ol>"],
  checkListItem: ['<ul class="checklist">', "</ul>"],
};

export function renderBlocks(blocks: Block[] | unknown): string {
  if (!Array.isArray(blocks)) return "";
  let html = "";
  let openList: string | null = null;

  for (const block of blocks as Block[]) {
    const wrap = LIST_WRAP[block.type];
    if (wrap) {
      if (openList !== block.type) {
        if (openList) html += LIST_WRAP[openList][1];
        html += wrap[0];
        openList = block.type;
      }
    } else if (openList) {
      html += LIST_WRAP[openList][1];
      openList = null;
    }
    html += renderBlock(block);
  }
  if (openList) html += LIST_WRAP[openList][1];
  return html;
}

/** Convert a stored BlockNote document to an HTML string. */
export function blocksToHtml(doc: unknown): string {
  return renderBlocks(doc);
}
