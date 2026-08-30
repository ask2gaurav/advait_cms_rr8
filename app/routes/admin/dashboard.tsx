import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { connectDb } from "~/lib/db.server";
import { readContentMeta } from "~/lib/content-meta.server";
import { Page, Post, CaseStudy, Media, Menu } from "~/lib/models/index.server";

export function meta() {
  return [{ title: "Dashboard — Admin" }];
}

export async function loader() {
  await connectDb();
  const [pages, posts, caseStudies, media, menus] = await Promise.all([
    Page.countDocuments(),
    Post.countDocuments(),
    CaseStudy.countDocuments(),
    Media.countDocuments(),
    Menu.countDocuments(),
  ]);

  const lastExport = readContentMeta()?.exportedAt ?? null;

  return { counts: { pages, posts, caseStudies, media, menus }, lastExport };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { counts, lastExport } = loaderData;
  const cards: [string, number, string][] = [
    ["Pages", counts.pages, "/admin/pages"],
    ["Posts", counts.posts, "/admin/posts"],
    ["Case Studies", counts.caseStudies, "/admin/case-studies"],
    ["Media", counts.media, "/admin/media"],
    ["Menus", counts.menus, "/admin/menus"],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([label, count, href]) => (
          <Link
            key={label}
            to={href}
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-400 dark:border-gray-800"
          >
            <div className="text-2xl font-semibold">{count}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </Link>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Last content export:{" "}
        {lastExport ? new Date(lastExport).toLocaleString() : "never"}
      </p>
    </div>
  );
}
