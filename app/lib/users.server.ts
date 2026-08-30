import { connectDb } from "~/lib/db.server";
import { User, hashPassword } from "~/lib/models/user.server";
import { userSchema, parseForm } from "~/lib/validation";
import { FieldError } from "~/lib/admin.server";

export interface UserValues {
  email?: string;
  name?: string;
  role?: string;
  active?: boolean;
}

export async function listUsers() {
  await connectDb();
  const docs = await User.find().sort({ createdAt: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    email: d.email,
    name: d.name,
    role: d.role,
    active: d.active,
  }));
}

export async function getUserValues(id: string): Promise<UserValues | null> {
  await connectDb();
  const d = await User.findById(id).lean();
  if (!d) return null;
  return { email: d.email, name: d.name, role: d.role, active: d.active };
}

async function activeMasterCount(excludeId?: string) {
  const q: Record<string, unknown> = { role: "master", active: true };
  if (excludeId) q._id = { $ne: excludeId };
  return User.countDocuments(q);
}

export async function saveUser(form: FormData, id?: string) {
  await connectDb();
  const input = parseForm(userSchema, form);

  if (!id && !input.password) {
    throw new FieldError("password", "Password is required for a new user.");
  }

  // Guard: never remove the last active master.
  if (id) {
    const current = await User.findById(id);
    if (!current) throw new FieldError("_", "User not found.");
    const losingMaster =
      current.role === "master" &&
      current.active &&
      (input.role !== "master" || !input.active);
    if (losingMaster && (await activeMasterCount(id)) === 0) {
      throw new FieldError("_", "There must be at least one active master user.");
    }
  }

  const doc = id ? await User.findById(id) : new User();
  if (!doc) throw new FieldError("_", "User not found.");
  doc.email = input.email;
  doc.name = input.name;
  doc.role = input.role;
  doc.active = input.active;
  if (input.password) doc.passwordHash = await hashPassword(input.password);
  await doc.save();
}

export async function deleteUser(id: string, currentUserId: string) {
  await connectDb();
  if (id === currentUserId) {
    throw new FieldError("_", "You cannot delete your own account.");
  }
  const target = await User.findById(id);
  if (!target) return;
  if (target.role === "master" && (await activeMasterCount(id)) === 0) {
    throw new FieldError("_", "There must be at least one active master user.");
  }
  await User.findByIdAndDelete(id);
}
