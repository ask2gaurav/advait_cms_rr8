import { redirect } from "react-router";
import type { Route } from "./+types/posts.new";
import { savePost } from "~/lib/posts.server";
import { saveOrError } from "~/lib/admin.server";
import { PageHeader } from "~/admin/form";
import { PostForm } from "~/admin/PostForm";

export function meta() {
  return [{ title: "New post — Admin" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const err = await saveOrError(() => savePost(form));
  if (err) return err;
  return redirect("/admin/posts");
}

export default function NewPost({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader title="New post" />
      <PostForm errors={actionData ?? undefined} submitLabel="Create post" />
    </div>
  );
}
