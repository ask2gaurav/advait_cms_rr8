import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";
import type { ContentStatus } from "~/lib/types";

const { Schema, model, models } = mongoose;

export interface PageAttrs {
  title: string;
  slug: string;
  status: ContentStatus;
  template: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: Types.ObjectId;
  excerpt?: string;
  body: unknown;
  bodyFormat?: string;
  sections?: { type: string; data: Record<string, unknown> }[];
  order?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageAttrs>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true,
    },
    template: { type: String, default: "default", required: true },
    seoTitle: String,
    seoDescription: String,
    ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
    excerpt: String,
    body: { type: Schema.Types.Mixed, default: null },
    bodyFormat: {
      type: String,
      enum: ["blocknote", "lexical"],
      default: "blocknote",
    },
    sections: [{ type: { type: String }, data: Schema.Types.Mixed }],
    order: Number,
    publishedAt: Date,
  },
  { timestamps: true },
);

pageSchema.index({ status: 1, publishedAt: -1 });

export type PageDoc = HydratedDocument<PageAttrs>;

export const Page =
  (models.Page as Model<PageAttrs>) ?? model<PageAttrs>("Page", pageSchema);
