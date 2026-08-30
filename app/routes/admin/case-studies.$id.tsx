import { redirect } from "react-router";
import type { Route } from "./+types/case-studies.$id";
import {
  getCaseStudyValues,
  saveCaseStudy,
  deleteCaseStudy,
} from "~/lib/case-studies.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { CaseStudyForm } from "~/admin/CaseStudyForm";

export function meta() {
  return [{ title: "Edit case study — Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const values = await getCaseStudyValues(params.id);
  if (!values) throw new Response("Not found", { status: 404 });
  return { values };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    await deleteCaseStudy(params.id);
    return redirect("/admin/case-studies");
  }
  const err = await saveOrError(() => saveCaseStudy(form, params.id));
  if (err) return err;
  return redirect("/admin/case-studies");
}

export default function EditCaseStudy({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title={`Edit: ${loaderData.values.title}`} />
      <CaseStudyForm
        values={loaderData.values}
        errors={actionData ?? undefined}
        submitLabel="Save changes"
      />
    </div>
  );
}
