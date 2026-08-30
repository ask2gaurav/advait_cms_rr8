import { redirect } from "react-router";
import type { Route } from "./+types/users.$id";
import { requireUser } from "~/lib/auth.server";
import { getUserValues, saveUser, deleteUser } from "~/lib/users.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { UserForm } from "~/admin/UserForm";

export function meta() {
  return [{ title: "Edit user — Admin" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request, "master");
  const values = await getUserValues(params.id);
  if (!values) throw new Response("Not found", { status: 404 });
  return { values };
}

export async function action({ request, params }: Route.ActionArgs) {
  const me = await requireUser(request, "master");
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    const err = await saveOrError(() => deleteUser(params.id, me.id));
    if (err) return err;
    return redirect("/admin/users");
  }
  const err = await saveOrError(() => saveUser(form, params.id));
  if (err) return err;
  return redirect("/admin/users");
}

export default function EditUser({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title={`Edit: ${loaderData.values.name}`} />
      <UserForm
        values={loaderData.values}
        errors={actionData ?? undefined}
        submitLabel="Save changes"
        isNew={false}
      />
    </div>
  );
}
