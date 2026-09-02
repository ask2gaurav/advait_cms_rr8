import { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  $createCodeNode,
  CodeHighlightNode,
  CodeNode,
} from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type EditorState,
  type LexicalCommand,
} from "lexical";
import { $createImageNode, ImageNode } from "~/admin/lexical/ImageNode";
import { MediaPickerDialog } from "~/admin/MediaPickerDialog";

export interface LexicalEditorProps {
  name: string;
  initialContent?: unknown;
}

const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; altText: string }> =
  createCommand("INSERT_IMAGE_COMMAND");

const theme = {
  paragraph: "mb-2",
  quote: "border-l-4 border-brand-300 pl-4 italic text-gray-600",
  heading: {
    h1: "text-3xl font-semibold mt-4 mb-2",
    h2: "text-2xl font-semibold mt-4 mb-2",
    h3: "text-xl font-semibold mt-3 mb-2",
    h4: "text-lg font-semibold mt-3 mb-1",
  },
  list: {
    ul: "list-disc ml-6",
    ol: "list-decimal ml-6",
    listitem: "mb-1",
    nested: { listitem: "list-none" },
  },
  link: "text-brand-600 underline",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "rounded bg-gray-100 px-1 py-0.5 text-[0.9em] dark:bg-gray-800",
  },
  code: "block rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto font-mono",
  image: "inline-block",
  table: "border-collapse w-full text-sm",
  tableCell: "border border-gray-300 px-2 py-1 dark:border-gray-700",
  tableCellHeader: "bg-gray-100 font-semibold dark:bg-gray-800",
};

function isLexicalState(v: unknown): v is { root: unknown } {
  return !!v && typeof v === "object" && !Array.isArray(v) && "root" in v;
}

function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(
    () =>
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          $insertNodes([$createImageNode(payload.src, payload.altText)]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    [editor],
  );
  return null;
}

const BLOCKS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "quote", label: "Quote" },
  { value: "code", label: "Code block" },
] as const;

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [pickerOpen, setPickerOpen] = useState(false);

  const setBlock = (value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (value === "paragraph") $setBlocksType(selection, () => $createParagraphNode());
      else if (value === "quote") $setBlocksType(selection, () => $createQuoteNode());
      else if (value === "code") $setBlocksType(selection, () => $createCodeNode());
      else $setBlocksType(selection, () => $createHeadingNode(value as "h1"));
    });
  };

  const btn =
    "h-7 min-w-7 rounded px-2 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-1.5 dark:border-gray-700 dark:bg-gray-900">
      <select
        className="h-7 rounded border border-gray-300 bg-white px-1 text-xs dark:border-gray-700 dark:bg-gray-950"
        onChange={(e) => setBlock(e.target.value)}
        defaultValue="paragraph"
        aria-label="Block type"
      >
        {BLOCKS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <b>B</b>
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <i>I</i>
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <u>U</u>
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}>
        <s>S</s>
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}>
        {"</>"}
      </button>
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700" />
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        • List
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        1. List
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}>
        ☑ List
      </button>
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700" />
      <button
        type="button"
        className={btn}
        onClick={() => {
          const url = window.prompt("Link URL");
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url ? url : null);
        }}
      >
        Link
      </button>
      <button type="button" className={btn} onClick={() => setPickerOpen(true)}>
        Image
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
      >
        —
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => {
          const rows = Number(window.prompt("Rows", "3"));
          const columns = Number(window.prompt("Columns", "3"));
          if (rows > 0 && columns > 0)
            editor.dispatchCommand(INSERT_TABLE_COMMAND, {
              rows: String(rows),
              columns: String(columns),
            });
        }}
      >
        Table
      </button>
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700" />
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}>
        ⯇
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}>
        ≡
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}>
        ⯈
      </button>
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700" />
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        ↶
      </button>
      <button type="button" className={btn} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        ↷
      </button>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) =>
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: m.path,
            altText: m.alt ?? m.originalName ?? "",
          })
        }
      />
    </div>
  );
}

/** Browser-only Lexical editor that syncs its document JSON into a hidden input. */
export default function LexicalEditor({ name, initialContent }: LexicalEditorProps) {
  const [json, setJson] = useState(() =>
    isLexicalState(initialContent) ? JSON.stringify(initialContent) : "",
  );

  const initialConfig = {
    namespace: "cms",
    theme,
    onError: (e: Error) => {
      throw e;
    },
    editorState: isLexicalState(initialContent)
      ? JSON.stringify(initialContent)
      : undefined,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      ImageNode,
    ],
  };

  const onChange = useCallback((editorState: EditorState) => {
    setJson(JSON.stringify(editorState.toJSON()));
  }, []);

  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-700">
      <input type="hidden" name={name} value={json} />
      <input type="hidden" name="bodyFormat" value="lexical" />
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative px-3 py-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="prose-content min-h-40 outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
                Write something…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin />
        <TablePlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <ImagePlugin />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
