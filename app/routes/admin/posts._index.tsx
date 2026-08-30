import { redirect } from "react-router";
import type { Route } from "./+types/posts._index";
import { listPosts, deletePost } from "~/lib/posts.server";
import { PageHeader, LinkButton } from "~/admin/form";
import { DataTable } from "~/admin/DataTable";

export function meta() {
  return [{ title: "Posts — Admin" }];
}

export async function loader() {
  return { posts: await listPosts() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get("intent") === "delete") {
    await deletePost(String(form.get("id")));
  }
  return redirect("/admin/posts");
}

export default function PostsIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader
        title="Posts"
        action={<LinkButton to="/admin/posts/new">New post</LinkButton>}
      />
      <DataTable
        rows={loaderData.posts}
        editHref={(r) => `/admin/posts/${r.id}`}
        columns={[
          { header: "Title", cell: (r) => r.title },
          { header: "Slug", cell: (r) => r.slug },
          { header: "Status", cell: (r) => r.status },
          {
            header: "Updated",
            cell: (r) => new Date(r.updatedAt).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
