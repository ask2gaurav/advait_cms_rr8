import { Form, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser } from "~/lib/auth.server";
import { getEditorChoice } from "~/lib/settings.server";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const editorChoice = await getEditorChoice();
  return { user, editorChoice };
}

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/posts", label: "Posts" },
  { to: "/admin/case-studies", label: "Case Studies" },
  { to: "/admin/menus", label: "Menus" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/company-history", label: "Company History" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 p-4 dark:border-gray-800">
        <div className="mb-6 text-sm font-semibold">CMS Admin</div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-1.5 text-sm",
                  isActive
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
          <span className="text-sm text-gray-500">
            {user.name} · {user.role}
          </span>
          <Form method="post" action="/admin/logout">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </Form>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
