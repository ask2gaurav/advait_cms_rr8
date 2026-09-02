import { useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export interface BlockNoteEditorProps {
  /** Hidden form field name that receives the serialized JSON document. */
  name: string;
  initialContent?: unknown[];
}

/** Browser-only BlockNote editor that syncs its document into a hidden input. */
export default function BlockNoteEditor({
  name,
  initialContent,
}: BlockNoteEditorProps) {
  const editor = useCreateBlockNote({
    initialContent:
      Array.isArray(initialContent) && initialContent.length > 0
        ? (initialContent as never)
        : undefined,
  });
  const [json, setJson] = useState(() =>
    JSON.stringify(initialContent ?? []),
  );

  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-700">
      <input type="hidden" name={name} value={json} />
      <input type="hidden" name="bodyFormat" value="blocknote" />
      <BlockNoteView
        editor={editor}
        onChange={() => setJson(JSON.stringify(editor.document))}
        className="py-2"
      />
    </div>
  );
}
