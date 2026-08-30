import { createCookieSessionStorage, redirect } from "react-router";
import { connectDb } from "~/lib/db.server";
import { env } from "~/lib/env.server";
import { User, type UserDoc } from "~/lib/models/user.server";

const sessionSecret = env.SESSION_SECRET || "dev-insecure-secret-change-me";

const storage = createCookieSessionStorage({
  cookie: {
    name: "__cms_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  },
});

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "master" | "admin";
};

function toSessionUser(doc: UserDoc): SessionUser {
  return {
    id: String(doc._id),
    email: doc.email,
    name: doc.name,
    role: doc.role,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  await connectDb();
  const user = (await User.findOne({
    email: email.toLowerCase().trim(),
    active: true,
  })) as UserDoc | null;
  if (!user) return null;
  const ok = await user.verifyPassword(password);
  if (!ok) return null;
  return toSessionUser(user);
}

export async function createUserSession(user: SessionUser, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", user.id);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await storage.commitSession(session) },
  });
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  await connectDb();
  const user = (await User.findById(userId)) as UserDoc | null;
  if (!user || !user.active) return null;
  return toSessionUser(user);
}

export async function requireUser(
  request: Request,
  role?: "master",
): Promise<SessionUser> {
  const user = await getSessionUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/admin/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  if (role && user.role !== role) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/admin/login", {
    headers: { "Set-Cookie": await storage.destroySession(session) },
  });
}
