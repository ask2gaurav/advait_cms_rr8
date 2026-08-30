import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Field } from "~/admin/form";

interface MediaItem {
  id: string;
  path: string;
  originalName: string;
  isImage: boolean;
  alt?: string;
}

/**
 * Form field that stores a Media id in a hidden input, with a modal picker
 * that reads the library from `/admin/media.json`.
 */
export function MediaField({
  name,
  label,
  defaultValue = "",
  error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !items) {
      fetch("/admin/media.json")
        .then((r) => r.json())
        .then((d) => setItems(d.media as MediaItem[]))
        .catch(() => setItems([]));
    }
  }, [open, items]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const selected = items?.find((i) => i.id === value);

  return (
    <Field label={label} error={error}>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-3">
        {selected?.isImage && (
          <img src={selected.path} alt="" className="h-12 w-12 rounded object-cover" />
        )}
        <span className="text-xs text-gray-500">
          {selected ? selected.originalName : value || "None selected"}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Choose
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setValue("")}>
            Clear
          </Button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="w-[min(90vw,640px)] rounded-lg p-0 backdrop:bg-black/40"
      >
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Select media</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-sm">
              Close
            </button>
          </div>
          {!items ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">
              No media yet. Upload files under Media first.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setValue(m.id);
                    setOpen(false);
                  }}
                  className="rounded border border-gray-200 p-1 hover:border-gray-500 dark:border-gray-700"
                >
                  {m.isImage ? (
                    <img src={m.path} alt="" className="h-24 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 items-center justify-center text-[10px]">
                      {m.originalName}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </Field>
  );
}
