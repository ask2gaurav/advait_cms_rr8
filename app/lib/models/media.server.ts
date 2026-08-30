import mongoose, { type Model, type HydratedDocument } from "mongoose";

const { Schema, model, models } = mongoose;

export interface MediaAttrs {
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<MediaAttrs>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    alt: String,
    title: String,
    uploadedBy: String,
  },
  { timestamps: true },
);

export type MediaDoc = HydratedDocument<MediaAttrs>;

export const Media =
  (models.Media as Model<MediaAttrs>) ?? model<MediaAttrs>("Media", mediaSchema);
