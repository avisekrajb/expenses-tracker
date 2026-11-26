import mongoose from "mongoose";
import { DEFAULT_FEATURES } from "../config/features.js";

// One document holds all admin-managed public content and global feature switches.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true, required: true },
    logoUrl: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      responseTime: { type: String, default: "" },
    },
    footer: {
      tagline: { type: String, default: "" },
      copyright: { type: String, default: "" },
      socialLinks: { type: [{ label: String, url: String }], default: [] },
    },
    donations: {
      esewaId: { type: String, default: "" },
      esewaName: { type: String, default: "" },
      upiId: { type: String, default: "" },
      phone: { type: String, default: "" },
      bankName: { type: String, default: "" },
      bankAccount: { type: String, default: "" },
      bankBranch: { type: String, default: "" },
      bankSwift: { type: String, default: "" },
      qrUrl: { type: String, default: "" },
      qrPublicId: { type: String, default: "" },
      note: { type: String, default: "" },
    },
    features: { type: Object, default: () => ({ ...DEFAULT_FEATURES }) },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("SiteSettings", settingsSchema);
