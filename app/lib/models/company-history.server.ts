import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";

const { Schema, model, models } = mongoose;

export interface CompanyAddressAttrs {
  label: string;
  lines?: string;
  city?: string;
  country?: string;
  type: string; // "main-office" | "branch" | "registered-office"
  status: string; // "open-current" | "temporarily-closed" | "permanently-closed"
  fromYear?: number;
  toYear?: number;
  note?: string;
  order?: number;
  hidden?: boolean;
}

export interface CompanyLogoAttrs {
  image?: Types.ObjectId;
  label?: string;
  fromYear?: number;
  toYear?: number;
  note?: string;
  order?: number;
  hidden?: boolean;
}

export interface CompanyHistoryAttrs {
  key: string;
  intro?: string;
  addresses: CompanyAddressAttrs[];
  logos: CompanyLogoAttrs[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<CompanyAddressAttrs>(
  {
    label: { type: String, required: true },
    lines: String,
    city: String,
    country: String,
    type: { type: String, default: "main-office" },
    status: { type: String, default: "open-current" },
    fromYear: Number,
    toYear: Number,
    note: String,
    order: Number,
    hidden: Boolean,
  },
  { _id: false },
);

const logoSchema = new Schema<CompanyLogoAttrs>(
  {
    image: { type: Schema.Types.ObjectId, ref: "Media" },
    label: String,
    fromYear: Number,
    toYear: Number,
    note: String,
    order: Number,
    hidden: Boolean,
  },
  { _id: false },
);

const companyHistorySchema = new Schema<CompanyHistoryAttrs>(
  {
    key: { type: String, required: true, unique: true, default: "company-history" },
    intro: String,
    addresses: { type: [addressSchema], default: [] },
    logos: { type: [logoSchema], default: [] },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true },
);

export type CompanyHistoryDoc = HydratedDocument<CompanyHistoryAttrs>;

export const CompanyHistory =
  (models.CompanyHistory as Model<CompanyHistoryAttrs>) ??
  model<CompanyHistoryAttrs>("CompanyHistory", companyHistorySchema);
