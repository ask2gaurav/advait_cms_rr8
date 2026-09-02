import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Field } from "~/admin/form";
import { MediaPickerDialog, useMediaLibrary } from "~/admin/MediaPickerDialog";

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
  // Keep the label/preview populated even before the dialog is first opened.
  const items = useMediaLibrary(true);
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

      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => setValue(m.id)}
      />
    </Field>
  );
}
