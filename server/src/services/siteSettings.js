import SiteSettings from "../models/SiteSettings.js";
import { env } from "../config/env.js";
import { DEFAULT_FEATURES, FEATURE_KEYS } from "../config/features.js";

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const donationLimit = (key) => (key === "qrUrl" ? 100000 : 1000);

export async function getSettings() {
  let doc = await SiteSettings.findOne({ key: "site" }).lean();
  if (!doc) {
    try {
      doc = (await SiteSettings.findOneAndUpdate(
        { key: "site" },
        { $setOnInsert: { key: "site" } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )).toObject();
    } catch {
      doc = await SiteSettings.findOne({ key: "site" }).lean();
    }
  }
  doc = doc || {};

  // Database values win; environment values are the fallback until an admin edits them.
  const donations = Object.fromEntries(
    Object.keys(env.donation).map((key) => [key, clean(doc.donations?.[key], donationLimit(key)) || env.donation[key] || ""])
  );

  return {
    logoUrl: clean(doc.logoUrl, 1000),
    contact: {
      email: clean(doc.contact?.email, 200) || "hello@kharcha.app",
      phone: clean(doc.contact?.phone, 100),
      address: clean(doc.contact?.address, 300),
      responseTime: clean(doc.contact?.responseTime, 100),
    },
    footer: {
      tagline: clean(doc.footer?.tagline, 300) || "Made in Kathmandu for anyone who wants to know where their money went.",
      copyright: clean(doc.footer?.copyright, 200) || `© ${new Date().getFullYear()} Kharcha. Built with care in Nepal.`,
      socialLinks: (doc.footer?.socialLinks || [])
        .filter((l) => l?.label && /^https?:\/\//.test(l?.url || ""))
        .slice(0, 8)
        .map((l) => ({ label: clean(l.label, 60), url: clean(l.url, 500) })),
    },
    donations,
    features: { ...DEFAULT_FEATURES, ...(doc.features || {}) },
  };
}

export async function updateSettings(patch = {}) {
  const $set = {};
  if ("logoUrl" in patch) $set.logoUrl = clean(patch.logoUrl, 1000);
  for (const key of ["email", "phone", "address", "responseTime"]) {
    if (key in (patch.contact || {})) $set[`contact.${key}`] = clean(patch.contact[key], key === "address" ? 300 : 200);
  }
  if ("tagline" in (patch.footer || {})) $set["footer.tagline"] = clean(patch.footer.tagline, 300);
  if ("copyright" in (patch.footer || {})) $set["footer.copyright"] = clean(patch.footer.copyright, 200);
  if (Array.isArray(patch.footer?.socialLinks)) {
    $set["footer.socialLinks"] = patch.footer.socialLinks
      .filter((l) => l?.label && /^https?:\/\//.test(l?.url || ""))
      .slice(0, 8)
      .map((l) => ({ label: clean(l.label, 60), url: clean(l.url, 500) }));
  }
  for (const key of Object.keys(env.donation)) {
    if (key in (patch.donations || {})) $set[`donations.${key}`] = clean(patch.donations[key], donationLimit(key));
  }
  if (patch.features && typeof patch.features === "object") {
    for (const key of FEATURE_KEYS) {
      if (typeof patch.features[key] === "boolean") $set[`features.${key}`] = patch.features[key];
    }
  }
  if (!Object.keys($set).length) return getSettings();

  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set, $setOnInsert: { key: "site" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return getSettings();
}

export async function saveLogo(logo) {
  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set: { logoUrl: logo.url, logoPublicId: logo.publicId || "" }, $setOnInsert: { key: "site" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return getSettings();
}

export async function donationQrPublicId() {
  const doc = await SiteSettings.findOne({ key: "site" }).lean();
  return clean(doc?.donations?.qrPublicId, 200);
}

// QR images can be uploaded by the admin; Cloudinary is used when configured,
// otherwise the image is stored inline so the feature still works locally.
export async function saveDonationQr(qr) {
  await SiteSettings.findOneAndUpdate(
    { key: "site" },
    {
      $set: { "donations.qrUrl": clean(qr.url, 100000), "donations.qrPublicId": clean(qr.publicId, 200) },
      $setOnInsert: { key: "site" },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return getSettings();
}
