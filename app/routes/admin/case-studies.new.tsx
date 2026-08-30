import { redirect } from "react-router";
import type { Route } from "./+types/case-studies.new";
import { saveCaseStudy } from "~/lib/case-studies.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { CaseStudyForm } from "~/admin/CaseStudyForm";

export function meta() {
  return [{ title: "New case study — Admin" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const err = await saveOrError(() => saveCaseStudy(form));
  if (err) return err;
  return redirect("/admin/case-studies");
}

export default function NewCaseStudy({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="New case study" />
      <CaseStudyForm errors={actionData ?? undefined} submitLabel="Create case study" />
    </div>
  );
}
