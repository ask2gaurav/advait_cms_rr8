import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

// The admin panel is local-only. It is present during `react-router dev` but
// excluded from the production build (`EXCLUDE_ADMIN=1`, set by `npm run build`)
// so it can never be deployed and so prerendering doesn't choke on its server
// loaders/actions.
const routes: RouteConfig = [
  layout("routes/public.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("approach", "routes/approach.tsx"),
    route("services", "routes/services.tsx"),
    route("products", "routes/products.tsx"),
    route("contact", "routes/contact.tsx"),
    route("works", "routes/works._index.tsx"),
    route("works/:slug", "routes/works.$slug.tsx"),
    route("blog", "routes/blog._index.tsx"),
    route("blog/:slug", "routes/blog.$slug.tsx"),
    route("history", "routes/history.tsx"),
    route("offline", "routes/offline.tsx"),
    route(":slug", "routes/page.$slug.tsx"),
  ]),
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),
  route("robots.txt", "routes/robots[.]txt.tsx"),
];

if (process.env.EXCLUDE_ADMIN !== "1") {
  routes.push(
    ...prefix("admin", [
      route("login", "routes/admin/login.tsx"),
      route("logout", "routes/admin/logout.tsx"),
      layout("routes/admin/layout.tsx", [
        index("routes/admin/dashboard.tsx"),
        route("pages", "routes/admin/pages._index.tsx"),
        route("pages/new", "routes/admin/pages.new.tsx"),
        route("pages/:id", "routes/admin/pages.$id.tsx"),
        route("posts", "routes/admin/posts._index.tsx"),
        route("posts/new", "routes/admin/posts.new.tsx"),
        route("posts/:id", "routes/admin/posts.$id.tsx"),
        route("case-studies", "routes/admin/case-studies._index.tsx"),
        route("case-studies/new", "routes/admin/case-studies.new.tsx"),
        route("case-studies/:id", "routes/admin/case-studies.$id.tsx"),
        route("menus", "routes/admin/menus._index.tsx"),
        route("menus/:id", "routes/admin/menus.$id.tsx"),
        route("media", "routes/admin/media._index.tsx"),
        route("media.json", "routes/admin/media.json.tsx"),
        route("users", "routes/admin/users._index.tsx"),
        route("users/new", "routes/admin/users.new.tsx"),
        route("users/:id", "routes/admin/users.$id.tsx"),
        route("company-history", "routes/admin/company-history.tsx"),
        route("settings", "routes/admin/settings.tsx"),
      ]),
    ]),
  );
}

export default routes;
