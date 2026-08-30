import bcrypt from "bcryptjs";
import mongoose, { type Model, type HydratedDocument } from "mongoose";

const { Schema, model, models } = mongoose;

export interface UserAttrs {
  email: string;
  name: string;
  passwordHash: string;
  role: "master" | "admin";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  verifyPassword(password: string): Promise<boolean>;
}

type UserModel = Model<UserAttrs, {}, UserMethods>;
export type UserDoc = HydratedDocument<UserAttrs, UserMethods>;

const userSchema = new Schema<UserAttrs, UserModel, UserMethods>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["master", "admin"], default: "admin", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.method("verifyPassword", function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export const User =
  (models.User as UserModel) ?? model<UserAttrs, UserModel>("User", userSchema);
