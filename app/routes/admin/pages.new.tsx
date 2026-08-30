import { redirect } from "react-router";
import type { Route } from "./+types/pages.new";
import { savePage } from "~/lib/pages.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { PageForm } from "~/admin/PageForm";

export function meta() {
  return [{ title: "New page — Admin" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const err = await saveOrError(() => savePage(form));
  if (err) return err;
  return redirect("/admin/pages");
}

export default function NewPage({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="New page" />
      <PageForm errors={actionData ?? undefined} submitLabel="Create page" />
    </div>
  );
}
