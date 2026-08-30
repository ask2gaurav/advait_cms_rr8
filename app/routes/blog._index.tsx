import { Link } from "react-router";
import type { Route } from "./+types/blog._index";
import { listPosts } from "~/lib/content";
import { buildMeta } from "~/lib/seo";
import { Container, PageHero } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { Badge } from "~/components/ui/Badge";

export function meta() {
  return buildMeta({
    title: "Insights",
    description:
      "Practical notes on reliable software, production RAG and AI-accelerated delivery.",
    path: "/blog",
  });
}

export function loader() {
  return { posts: listPosts() };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Notes from the field"
        lead="Practical writing on reliable software, production RAG and AI-accelerated delivery."
      />
      <Section>
        <Container>
          {posts.length === 0 ? (
            <p className="text-gray-500">No articles published yet.</p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-gray-200 p-6 transition-colors hover:border-brand-300 dark:border-gray-800 dark:hover:border-brand-500/40"
                  >
                    <p className="text-xs text-gray-500">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                      {p.readingTime ? ` · ${p.readingTime} min read` : ""}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                        {p.excerpt}
                      </p>
                    )}
                    {p.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
