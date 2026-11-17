import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Who can do what in /admin. */
export const ROLES = ["admin", "editor", "outlets"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator (everything)",
  editor: "Editor (products and blog)",
  outlets: "Outlet manager (outlets only)",
};

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, required: true, default: "editor" },
  active: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> = (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);