import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/menus.$id";
import { getMenuValues, saveMenu, deleteMenu } from "~/lib/menus.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader, Field, TextField, CheckboxField, FormActions } from "~/admin/form";
import { Textarea } from "~/components/ui/textarea";

export function meta() {
  return [{ title: "Edit menu — Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const values = await getMenuValues(params.id);
  if (!values) throw new Response("Not found", { status: 404 });
  return { values };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    await deleteMenu(params.id);
    return redirect("/admin/menus");
  }
  const err = await saveOrError(() => saveMenu(form, params.id));
  if (err) return err;
  return redirect("/admin/menus");
}

export default function EditMenu({ loaderData, actionData }: Route.ComponentProps) {
  const v = loaderData.values;
  const nav = useNavigation();
  const fe = actionData?.fieldErrors ?? {};
  return (
    <div>
      <PageHeader title={`Edit menu: ${v.name}`} />
      {actionData?.formError && (
        <p className="mb-4 text-sm text-red-600">{actionData.formError}</p>
      )}
      <Form method="post" className="max-w-2xl space-y-5">
        <TextField name="name" label="Name" defaultValue={v.name} required error={fe.name} />
        <TextField name="location" label="Location" defaultValue={v.location} required error={fe.location} hint="e.g. header, footer" />
        <CheckboxField name="isActive" label="Active" defaultChecked={v.isActive} />
        <Field
          label="Items (JSON)"
          error={fe.itemsJson}
          hint='Array of { label, type, url?, target?, order, isVisible, children? }'
        >
          <Textarea name="itemsJson" defaultValue={v.itemsJson} className="min-h-64 font-mono text-xs" />
        </Field>
        <FormActions busy={nav.state !== "idle"} backTo="/admin/menus" submitLabel="Save menu" />
      </Form>
    </div>
  );
}
