import { connectDb } from "~/lib/db.server";
import { Menu } from "~/lib/models/menu.server";
import { FieldError } from "~/lib/admin.server";

export interface MenuValues {
  name: string;
  location: string;
  isActive: boolean;
  itemsJson: string;
}

export async function listMenus() {
  await connectDb();
  const docs = await Menu.find().sort({ location: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    location: d.location,
    isActive: d.isActive,
    itemCount: d.items?.length ?? 0,
  }));
}

export async function getMenuValues(id: string): Promise<MenuValues | null> {
  await connectDb();
  const d = await Menu.findById(id).lean();
  if (!d) return null;
  return {
    name: d.name,
    location: d.location,
    isActive: d.isActive,
    itemsJson: JSON.stringify(d.items ?? [], null, 2),
  };
}

export async function saveMenu(form: FormData, id: string) {
  await connectDb();
  const name = String(form.get("name") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const isActive = form.get("isActive") === "true";
  const itemsRaw = String(form.get("itemsJson") ?? "[]");

  if (!name) throw new FieldError("name", "Name is required.");
  if (!location) throw new FieldError("location", "Location is required.");

  let items: unknown;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    throw new FieldError("itemsJson", "Items must be valid JSON.");
  }
  if (!Array.isArray(items)) {
    throw new FieldError("itemsJson", "Items must be a JSON array.");
  }

  const doc = await Menu.findById(id);
  if (!doc) throw new FieldError("_", "Menu not found.");
  doc.set({ name, location, isActive, items });
  await doc.save();
}

export async function createMenu(name: string, location: string) {
  await connectDb();
  const doc = await Menu.create({ name, location, items: [], isActive: true });
  return String(doc._id);
}

export async function deleteMenu(id: string) {
  await connectDb();
  await Menu.findByIdAndDelete(id);
}
