import { lazy, Suspense } from "react";
import { ClientOnly } from "~/components/ClientOnly";

const BlockNoteEditor = lazy(() => import("./BlockNoteEditor.client"));
const LexicalEditor = lazy(() => import("./LexicalEditor.client"));

/**
 * Admin rich-text field. Renders a hidden `<input name={name}>` containing the
 * serialized document JSON, plus a hidden `<input name="bodyFormat">` recording
 * which editor produced it, so both post with the surrounding form.
 *
 * `format` picks the editor: an existing document's stored `bodyFormat`, or the
 * site-wide default from Settings for new documents.
 */
export function RichTextEditor({
  name,
  format,
  initialContent,
}: {
  name: string;
  format: "blocknote" | "lexical";
  initialContent?: unknown;
}) {
  const fallback = (
    <div className="h-40 animate-pulse rounded-md border border-gray-200 dark:border-gray-800" />
  );
  return (
    <ClientOnly fallback={fallback}>
      {() => (
        <Suspense fallback={fallback}>
          {format === "lexical" ? (
            <LexicalEditor name={name} initialContent={initialContent} />
          ) : (
            <BlockNoteEditor
              name={name}
              initialContent={
                Array.isArray(initialContent) ? initialContent : undefined
              }
            />
          )}
        </Suspense>
      )}
    </ClientOnly>
  );
}
