import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";
import type { ContentStatus } from "~/lib/types";

const { Schema, model, models } = mongoose;

export interface PostAttrs {
  title: string;
  slug: string;
  status: ContentStatus;
  seoTitle?: string;
  seoDescription?: string;
  excerpt?: string;
  body: unknown;
  bodyFormat?: string;
  coverImage?: Types.ObjectId;
  ogImage?: Types.ObjectId;
  tags: string[];
  categories: string[];
  author?: string;
  readingTime?: number;
  featured?: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostAttrs>(
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
    bodyFormat: {
      type: String,
      enum: ["blocknote", "lexical"],
      default: "blocknote",
    },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
    tags: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    author: String,
    readingTime: Number,
    featured: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true },
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ categories: 1 });

export type PostDoc = HydratedDocument<PostAttrs>;

export const Post =
  (models.Post as Model<PostAttrs>) ?? model<PostAttrs>("Post", postSchema);
