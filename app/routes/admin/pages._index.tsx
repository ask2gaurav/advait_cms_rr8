import { redirect } from "react-router";
import type { Route } from "./+types/pages._index";
import { listPages, deletePage } from "~/lib/pages.server";
import { PageHeader, LinkButton } from "~/admin/form";
import { DataTable } from "~/admin/DataTable";

export function meta() {
  return [{ title: "Pages — Admin" }];
}

export async function loader() {
  return { pages: await listPages() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete") await deletePage(String(form.get("id")));
  return redirect("/admin/pages");
}

export default function PagesIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="Pages" action={<LinkButton to="/admin/pages/new">New page</LinkButton>} />
      <DataTable
        rows={loaderData.pages}
        editHref={(r) => `/admin/pages/${r.id}`}
        columns={[
          { header: "Title", cell: (r) => r.title },
          { header: "Slug", cell: (r) => r.slug },
          { header: "Template", cell: (r) => r.template },
          { header: "Status", cell: (r) => r.status },
          { header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
