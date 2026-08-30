import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { createUserSession, getSessionUser, login } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Sign in — Admin" }];
}

function safeRedirect(to: FormDataEntryValue | null): string {
  return typeof to === "string" && to.startsWith("/admin") ? to : "/admin";
}

export async function loader({ request }: Route.LoaderArgs) {
  if (await getSessionUser(request)) throw redirect("/admin");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const redirectTo = safeRedirect(form.get("redirectTo"));

  const user = await login(email, password);
  if (!user) return { error: "Invalid email or password." };
  return createUserSession(user, redirectTo);
}

export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Form method="post" className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Admin sign in</h1>
          <p className="text-sm text-gray-500">Local access only.</p>
        </div>
        <input
          type="hidden"
          name="redirectTo"
          value={
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("redirectTo") ?? ""
              : ""
          }
        />
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {actionData?.error && (
          <p className="text-sm text-red-600">{actionData.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </Form>
    </div>
  );
}
