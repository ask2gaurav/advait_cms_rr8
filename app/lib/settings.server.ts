import { connectDb } from "~/lib/db.server";
import { Setting } from "~/lib/models/setting.server";
import { settingsSchema, parseForm } from "~/lib/validation";

export interface SettingsValues {
  siteName: string;
  siteUrl: string;
  tagline?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export async function getSettingsValues(): Promise<SettingsValues> {
  await connectDb();
  const d = await Setting.findOne({ key: "site" }).lean();
  const social = (d?.social ?? {}) as Record<string, string>;
  return {
    siteName: d?.siteName ?? "My Site",
    siteUrl: d?.siteUrl ?? "https://example.com",
    tagline: d?.tagline,
    defaultSeoTitle: d?.defaultSeoTitle,
    defaultSeoDescription: d?.defaultSeoDescription,
    contactEmail: d?.contactEmail,
    contactPhone: d?.contactPhone,
    address: d?.address,
    twitter: social.twitter,
    linkedin: social.linkedin,
    github: social.github,
  };
}

export async function saveSettings(form: FormData) {
  await connectDb();
  const input = parseForm(settingsSchema, form);
  await Setting.findOneAndUpdate(
    { key: "site" },
    {
      key: "site",
      siteName: input.siteName,
      siteUrl: input.siteUrl,
      tagline: input.tagline || undefined,
      defaultSeoTitle: input.defaultSeoTitle || undefined,
      defaultSeoDescription: input.defaultSeoDescription || undefined,
      contactEmail: input.contactEmail || undefined,
      contactPhone: input.contactPhone || undefined,
      address: input.address || undefined,
      social: {
        twitter: input.twitter || undefined,
        linkedin: input.linkedin || undefined,
        github: input.github || undefined,
      },
    },
    { upsert: true },
  );
}
