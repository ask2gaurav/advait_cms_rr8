import { Link } from "react-router";
import type { Route } from "./+types/blog.$slug";
import { getPost, getSettings } from "~/lib/content";
import { articleJsonLd, breadcrumbJsonLd, buildMeta } from "~/lib/seo";
import { Container, JsonLd, Prose } from "~/components/site";
import { Section } from "~/components/layout/Section";
import { Badge } from "~/components/ui/Badge";
import { Giscus } from "~/components/Giscus";
import { Img } from "~/components/Img";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.post) return buildMeta({ title: "Not found", noindex: true });
  const p = loaderData.post;
  return buildMeta({
    title: p.seoTitle ?? p.title,
    description: p.seoDescription ?? p.excerpt,
    image: p.ogImage ?? p.coverImage?.path,
    path: `/blog/${p.slug}`,
    type: "article",
  });
}

export function loader({ params }: Route.LoaderArgs) {
  const post = getPost(params.slug);
  if (!post) throw new Response("Not found", { status: 404 });
  return { post, giscus: getSettings().integrations?.giscus };
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, giscus } = loaderData;
  return (
    <Section as="article">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.ogImage ?? post.coverImage?.path,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          author: post.author,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Insights", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Container className="max-w-3xl">
        <Link
          to="/blog"
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Insights
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
          {post.author ? ` · ${post.author}` : ""}
          {post.readingTime ? ` · ${post.readingTime} min read` : ""}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {post.title}
        </h1>
        {post.coverImage && (
          <Img
            media={post.coverImage}
            alt={post.coverImage.alt ?? post.title}
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="my-8 w-full rounded-xl object-cover"
          />
        )}
        <div className="mt-8">
          <Prose html={post.bodyHtml} />
        </div>
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
        <Giscus config={giscus} />
      </Container>
    </Section>
  );
}
