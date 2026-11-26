import User from "../models/User.js";
import FeatureOverride from "../models/FeatureOverride.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/hashPw.js";
import { getSettings } from "./siteSettings.js";

export const isAdminEmail = (email) =>
  Boolean(email && env.ADMIN_EMAILS.includes(String(email).trim().toLowerCase()));

let bootstrapPromise = null;
let bootstrapped = false;

// Creates the admin accounts declared in ADMIN_EMAILS on first request. This also
// works on serverless/Vercel, where server startup code is not reliable.
export async function ensureAdmin() {
  if (!env.ADMIN_EMAILS.length || !env.ADMIN_BOOTSTRAP_PASSWORD || bootstrapped) return;
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    for (const email of env.ADMIN_EMAILS) {
      if (!/^\S+@\S+\.\S+$/.test(email)) continue;
      if (await User.exists({ email })) continue;
      await User.create({
        name: "Kharcha Admin",
        email,
        password: await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD),
      });
    }
    bootstrapped = true;
  })().catch((e) => { bootstrapPromise = null; throw e; });
  return bootstrapPromise;
}

// Global switches plus per-user overrides approved by an admin.
export async function effectiveFeatures(userId) {
  const [settings, overrides] = await Promise.all([
    getSettings(),
    userId ? FeatureOverride.find({ userId }).lean() : Promise.resolve([]),
  ]);
  const features = { ...settings.features };
  for (const row of overrides) features[row.feature] = Boolean(row.enabled);
  return features;
}
