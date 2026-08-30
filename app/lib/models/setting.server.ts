import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";

const { Schema, model, models } = mongoose;

export interface SettingAttrs {
  key: string;
  siteName: string;
  siteUrl: string;
  tagline?: string;
  logo?: Types.ObjectId;
  favicon?: Types.ObjectId;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultOgImage?: Types.ObjectId;
  social: Record<string, string>;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  integrations?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<SettingAttrs>(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    siteName: { type: String, default: "My Site" },
    siteUrl: { type: String, default: "https://example.com" },
    tagline: String,
    logo: { type: Schema.Types.ObjectId, ref: "Media" },
    favicon: { type: Schema.Types.ObjectId, ref: "Media" },
    defaultSeoTitle: String,
    defaultSeoDescription: String,
    defaultOgImage: { type: Schema.Types.ObjectId, ref: "Media" },
    social: { type: Schema.Types.Mixed, default: {} },
    contactEmail: String,
    contactPhone: String,
    address: String,
    integrations: { type: Schema.Types.Mixed, default: {} },
    extras: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type SettingDoc = HydratedDocument<SettingAttrs>;

export const Setting =
  (models.Setting as Model<SettingAttrs>) ??
  model<SettingAttrs>("Setting", settingSchema);
