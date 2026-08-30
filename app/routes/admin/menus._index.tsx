import { redirect, Form } from "react-router";
import type { Route } from "./+types/menus._index";
import { listMenus, createMenu, deleteMenu } from "~/lib/menus.server";
import { toSlug } from "~/lib/slug";
import { PageHeader } from "~/admin/form";
import { DataTable } from "~/admin/DataTable";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "Menus — Admin" }];
}

export async function loader() {
  return { menus: await listMenus() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "delete") {
    await deleteMenu(String(form.get("id")));
    return redirect("/admin/menus");
  }
  const name = String(form.get("name") ?? "").trim();
  if (name) {
    const id = await createMenu(name, toSlug(name));
    return redirect(`/admin/menus/${id}`);
  }
  return redirect("/admin/menus");
}

export default function MenusIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="Menus" />
      <Form method="post" className="mb-6 flex gap-2">
        <Input name="name" placeholder="New menu name" className="max-w-xs" />
        <Button type="submit">Create</Button>
      </Form>
      <DataTable
        rows={loaderData.menus}
        editHref={(r) => `/admin/menus/${r.id}`}
        columns={[
          { header: "Name", cell: (r) => r.name },
          { header: "Location", cell: (r) => r.location },
          { header: "Items", cell: (r) => r.itemCount },
          { header: "Active", cell: (r) => (r.isActive ? "yes" : "no") },
        ]}
      />
    </div>
  );
}
