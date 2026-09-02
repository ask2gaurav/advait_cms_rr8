import { useEffect, useRef, useState } from "react";

export interface MediaItem {
  id: string;
  path: string;
  originalName: string;
  isImage: boolean;
  alt?: string;
}

let cache: MediaItem[] | null = null;
let inflight: Promise<MediaItem[]> | null = null;

/** Loads the media library from `/admin/media.json` once per page load. */
export function useMediaLibrary(enabled: boolean) {
  const [items, setItems] = useState<MediaItem[] | null>(cache);
  useEffect(() => {
    if (!enabled || items) return;
    inflight ??= fetch("/admin/media.json")
      .then((r) => r.json())
      .then((d) => (d.media as MediaItem[]) ?? [])
      .catch(() => [] as MediaItem[]);
    inflight.then((list) => {
      cache = list;
      setItems(list);
    });
  }, [enabled, items]);
  return items;
}

/**
 * Modal grid picker over the media library. Shared by the admin `MediaField`
 * and the Lexical editor's "insert image" toolbar button.
 */
export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const items = useMediaLibrary(open);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(90vw,640px)] rounded-lg p-0 backdrop:bg-black/40"
    >
      <div className="max-h-[70vh] overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Select media</h2>
          <button type="button" onClick={onClose} className="text-sm">
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
                  onSelect(m);
                  onClose();
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
  );
}
