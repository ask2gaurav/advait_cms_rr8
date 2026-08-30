import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/media._index";
import { requireUser } from "~/lib/auth.server";
import { saveUpload } from "~/lib/upload.server";
import { listMedia, updateMediaAlt, deleteMedia } from "~/lib/media.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function meta() {
  return [{ title: "Media — Admin" }];
}

export async function loader() {
  return { media: await listMedia() };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "delete") {
    const err = await saveOrError(() => deleteMedia(String(form.get("id"))));
    return err ?? { ok: true };
  }
  if (intent === "alt") {
    await updateMediaAlt(String(form.get("id")), String(form.get("alt") ?? ""));
    return { ok: true };
  }
  // upload
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const err = await saveOrError(async () => {
    for (const f of files) await saveUpload(f, user.name);
  });
  return err ?? { ok: true };
}

export default function MediaLibrary({ loaderData, actionData }: Route.ComponentProps) {
  const nav = useNavigation();
  const fe = (actionData && "fieldErrors" in actionData && actionData.fieldErrors) || {};
  const formError = actionData && "formError" in actionData ? actionData.formError : undefined;

  return (
    <div>
      <PageHeader title="Media" />

      <Form
        method="post"
        encType="multipart/form-data"
        className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700"
      >
        <input type="file" name="files" multiple required className="text-sm" />
        <Button type="submit" disabled={nav.state !== "idle"}>
          {nav.state !== "idle" ? "Uploading…" : "Upload"}
        </Button>
        {fe.file && <p className="text-sm text-red-600">{fe.file}</p>}
      </Form>

      {formError && <p className="mb-4 text-sm text-red-600">{formError}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loaderData.media.map((m) => (
          <div
            key={m.id}
            className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            {m.isImage ? (
              <img
                src={m.path}
                alt={m.alt ?? m.originalName}
                className="h-32 w-full rounded object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded bg-gray-100 text-xs dark:bg-gray-800">
                {m.mimeType}
              </div>
            )}
            <p className="truncate text-xs text-gray-500" title={m.originalName}>
              {m.originalName}
              {m.width ? ` · ${m.width}×${m.height}` : ""}
            </p>
            <Form method="post" className="flex gap-1">
              <input type="hidden" name="intent" value="alt" />
              <input type="hidden" name="id" value={m.id} />
              <Input
                name="alt"
                defaultValue={m.alt ?? ""}
                placeholder="Alt text"
                className="h-7 text-xs"
              />
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
            </Form>
            <Form
              method="post"
              onSubmit={(e) => {
                if (!confirm("Delete this file?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Delete
              </button>
            </Form>
          </div>
        ))}
      </div>
    </div>
  );
}
