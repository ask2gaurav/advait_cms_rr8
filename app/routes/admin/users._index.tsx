import { redirect, data } from "react-router";
import type { Route } from "./+types/users._index";
import { requireUser } from "~/lib/auth.server";
import { listUsers, deleteUser } from "~/lib/users.server";
import { FieldError } from "~/lib/admin.server";
import { PageHeader, LinkButton } from "~/admin/form";
import { DataTable } from "~/admin/DataTable";

export function meta() {
  return [{ title: "Users — Admin" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, "master");
  return { users: await listUsers() };
}

export async function action({ request }: Route.ActionArgs) {
  const me = await requireUser(request, "master");
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    try {
      await deleteUser(String(form.get("id")), me.id);
    } catch (err) {
      if (err instanceof FieldError)
        return data({ formError: err.message }, { status: 400 });
      throw err;
    }
  }
  return redirect("/admin/users");
}

export default function UsersIndex({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="Users" action={<LinkButton to="/admin/users/new">New user</LinkButton>} />
      {actionData?.formError && (
        <p className="mb-4 text-sm text-red-600">{actionData.formError}</p>
      )}
      <DataTable
        rows={loaderData.users}
        editHref={(r) => `/admin/users/${r.id}`}
        columns={[
          { header: "Name", cell: (r) => r.name },
          { header: "Email", cell: (r) => r.email },
          { header: "Role", cell: (r) => r.role },
          { header: "Active", cell: (r) => (r.active ? "yes" : "no") },
        ]}
      />
    </div>
  );
}
