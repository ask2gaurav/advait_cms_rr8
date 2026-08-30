import { redirect } from "react-router";
import type { Route } from "./+types/users.new";
import { requireUser } from "~/lib/auth.server";
import { saveUser } from "~/lib/users.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { UserForm } from "~/admin/UserForm";

export function meta() {
  return [{ title: "New user — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, "master");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request, "master");
  const form = await request.formData();
  const err = await saveOrError(() => saveUser(form));
  if (err) return err;
  return redirect("/admin/users");
}

export default function NewUser({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="New user" />
      <UserForm errors={actionData ?? undefined} submitLabel="Create user" isNew />
    </div>
  );
}
