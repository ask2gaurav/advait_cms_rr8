import { redirect } from "react-router";
import type { Route } from "./+types/posts.$id";
import { getPostValues, savePost, deletePost } from "~/lib/posts.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { PostForm } from "~/admin/PostForm";

export function meta() {
  return [{ title: "Edit post — Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const values = await getPostValues(params.id);
  if (!values) throw new Response("Not found", { status: 404 });
  return { values };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    await deletePost(params.id);
    return redirect("/admin/posts");
  }
  const err = await saveOrError(() => savePost(form, params.id));
  if (err) return err;
  return redirect("/admin/posts");
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title={`Edit: ${loaderData.values.title}`} />
      <PostForm
        values={loaderData.values}
        errors={actionData ?? undefined}
        submitLabel="Save changes"
      />
    </div>
  );
}
