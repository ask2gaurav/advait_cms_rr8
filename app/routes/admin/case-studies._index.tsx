import { redirect } from "react-router";
import type { Route } from "./+types/case-studies._index";
import { listCaseStudies, deleteCaseStudy } from "~/lib/case-studies.server";
import { PageHeader, LinkButton } from "~/admin/form";
import { DataTable } from "~/admin/DataTable";

export function meta() {
  return [{ title: "Case Studies — Admin" }];
}

export async function loader() {
  return { items: await listCaseStudies() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete")
    await deleteCaseStudy(String(form.get("id")));
  return redirect("/admin/case-studies");
}

export default function CaseStudiesIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader
        title="Case Studies"
        action={<LinkButton to="/admin/case-studies/new">New case study</LinkButton>}
      />
      <DataTable
        rows={loaderData.items}
        editHref={(r) => `/admin/case-studies/${r.id}`}
        columns={[
          { header: "Title", cell: (r) => r.title },
          { header: "Client", cell: (r) => r.client },
          { header: "Status", cell: (r) => r.status },
          { header: "Updated", cell: (r) => new Date(r.updatedAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
