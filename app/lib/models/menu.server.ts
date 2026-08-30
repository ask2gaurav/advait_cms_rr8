import mongoose, {
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";

const { Schema, model, models } = mongoose;

export interface MenuItemAttrs {
  label: string;
  type: "page" | "post" | "caseStudy" | "custom" | "external";
  page?: Types.ObjectId;
  post?: Types.ObjectId;
  caseStudy?: Types.ObjectId;
  url?: string;
  target: "_self" | "_blank";
  order: number;
  isVisible: boolean;
  children?: MenuItemAttrs[];
}

export interface MenuAttrs {
  name: string;
  location: string;
  items: MenuItemAttrs[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<MenuItemAttrs>(
  {
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["page", "post", "caseStudy", "custom", "external"],
      default: "custom",
      required: true,
    },
    page: { type: Schema.Types.ObjectId, ref: "Page" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    caseStudy: { type: Schema.Types.ObjectId, ref: "CaseStudy" },
    url: String,
    target: { type: String, enum: ["_self", "_blank"], default: "_self" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false },
);
menuItemSchema.add({ children: { type: [menuItemSchema], default: undefined } });

const menuSchema = new Schema<MenuAttrs>(
  {
    name: { type: String, required: true },
    location: { type: String, default: "header", required: true },
    items: { type: [menuItemSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

menuSchema.index({ location: 1, isActive: 1 });

export type MenuDoc = HydratedDocument<MenuAttrs>;

export const Menu =
  (models.Menu as Model<MenuAttrs>) ?? model<MenuAttrs>("Menu", menuSchema);
