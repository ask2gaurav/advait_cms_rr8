import { lazy, Suspense } from "react";
import { ClientOnly } from "~/components/ClientOnly";

const BlockNoteEditor = lazy(() => import("./BlockNoteEditor.client"));

/**
 * Admin rich-text field. Renders a hidden `<input name={name}>` containing the
 * BlockNote document as JSON so it posts with the surrounding form.
 */
export function RichTextEditor({
  name,
  initialContent,
}: {
  name: string;
  initialContent?: unknown[];
}) {
  return (
    <ClientOnly
      fallback={
        <div className="h-40 animate-pulse rounded-md border border-gray-200 dark:border-gray-800" />
      }
    >
      {() => (
        <Suspense
          fallback={
            <div className="h-40 rounded-md border border-gray-200 dark:border-gray-800" />
          }
        >
          <BlockNoteEditor name={name} initialContent={initialContent} />
        </Suspense>
      )}
    </ClientOnly>
  );
}
