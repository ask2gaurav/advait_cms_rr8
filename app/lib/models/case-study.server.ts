import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";
import type { ContentStatus } from "~/lib/types";

const { Schema, model, models } = mongoose;

export interface CaseStudyAttrs {
  title: string;
  slug: string;
  status: ContentStatus;
  seoTitle?: string;
  seoDescription?: string;
  excerpt?: string;
  body: unknown;
  coverImage?: Types.ObjectId;
  ogImage?: Types.ObjectId;
  gallery: Types.ObjectId[];
  client?: string;
  industry?: string;
  services: string[];
  year?: number;
  url?: string;
  featured?: boolean;
  order?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const caseStudySchema = new Schema<CaseStudyAttrs>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true,
    },
    seoTitle: String,
    seoDescription: String,
    excerpt: String,
    body: { type: Schema.Types.Mixed, default: null },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: { type: [{ type: Schema.Types.ObjectId, ref: "Media" }], default: [] },
    client: String,
    industry: String,
    services: { type: [String], default: [] },
    year: Number,
    url: String,
    featured: { type: Boolean, default: false },
    order: Number,
    publishedAt: Date,
  },
  { timestamps: true },
);

caseStudySchema.index({ status: 1, publishedAt: -1 });
caseStudySchema.index({ featured: 1, order: 1 });

export type CaseStudyDoc = HydratedDocument<CaseStudyAttrs>;

export const CaseStudy =
  (models.CaseStudy as Model<CaseStudyAttrs>) ??
  model<CaseStudyAttrs>("CaseStudy", caseStudySchema);
