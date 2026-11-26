import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { generateSecret, generateURI, verify as verifyTotp } from "otplib";
import User from "../models/User.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { comparePassword } from "../utils/hashPw.js";
import { signToken, verifyChallenge } from "../utils/jwt.js";

const ISSUER = "Kharcha";
const secretOf = (user) => user?.twoFactor?.secret || "";

const makeBackupCodes = async () => {
  const plain = Array.from({ length: 8 }, () => {
    const bytes = randomBytes(6);
    return [...bytes].map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
  });
  return { plain, hashes: await Promise.all(plain.map((c) => bcrypt.hash(c, 8))) };
};

const codeMatches = async (user, code) => {
  const value = String(code || "").trim();
  if (!value) return { ok: false, backup: false };
  if (/^\d{6}$/.test(value) && secretOf(user)) {
    try {
      const result = await verifyTotp({ secret: secretOf(user), token: value, window: 1 });
      if (result.valid) return { ok: true, backup: false };
    } catch { /* fall through to backup codes */ }
  }
  const list = user.twoFactor?.backupCodes || [];
  for (let i = 0; i < list.length; i++) {
    if (await bcrypt.compare(value.toUpperCase(), list[i])) return { ok: true, backup: true, index: i };
  }
  return { ok: false, backup: false };
};

export const setup = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("+twoFactor.secret +twoFactor.backupCodes");
  if (!user) throw new HttpError(401, "Please log in again.");
  if (user.twoFactor?.enabled) throw new HttpError(400, "Two-step verification is already on.");
  const secret = generateSecret();
  user.twoFactor.secret = secret;
  user.twoFactor.backupCodes = [];
  await user.save();
  const uri = generateURI({ issuer: ISSUER, label: user.email, secret });
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 240, color: { dark: "#1b1f3b", light: "#ffffff" } });
  res.json({ secret, uri, qr });
});

export const enable = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("+twoFactor.secret +twoFactor.backupCodes");
  if (!user) throw new HttpError(401, "Please log in again.");
  if (user.twoFactor?.enabled) throw new HttpError(400, "Two-step verification is already on.");
  if (!secretOf(user)) throw new HttpError(400, "Start setup first.");
  const match = await codeMatches(user, req.body?.code);
  if (!match.ok) throw new HttpError(400, "That code is not valid. Check the time on your phone.");
  const { plain, hashes } = await makeBackupCodes();
  user.twoFactor.enabled = true;
  user.twoFactor.enabledAt = new Date();
  user.twoFactor.backupCodes = hashes;
  await user.save();
  res.json({ ok: true, backupCodes: plain, user });
});

export const disable = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("+password +twoFactor.secret +twoFactor.backupCodes");
  if (!user) throw new HttpError(401, "Please log in again.");
  if (!(await comparePassword(req.body?.password, user.password))) throw new HttpError(400, "Wrong password.");
  const match = await codeMatches(user, req.body?.code || req.body?.backupCode);
  if (!match.ok) throw new HttpError(400, "Enter a valid authenticator or backup code.");
  user.twoFactor.enabled = false;
  user.twoFactor.secret = null;
  user.twoFactor.backupCodes = [];
  user.twoFactor.enabledAt = null;
  await user.save();
  res.json({ ok: true, user });
});

// Second step of login. The challenge token is only valid for five minutes.
export const verifyLogin = asyncHandler(async (req, res) => {
  const { challengeToken, code, backupCode } = req.body || {};
  let payload;
  try { payload = verifyChallenge(challengeToken); }
  catch { throw new HttpError(401, "Your verification session expired. Log in again."); }
  const user = await User.findById(payload.id).select("+twoFactor.secret +twoFactor.backupCodes");
  if (!user) throw new HttpError(401, "Please log in again.");
  if (!user.twoFactor?.enabled) throw new HttpError(400, "Two-step verification is not enabled.");
  const match = await codeMatches(user, code || backupCode);
  if (!match.ok) throw new HttpError(400, "Wrong code. Try again or use a backup code.");
  if (match.backup) {
    user.twoFactor.backupCodes.splice(match.index, 1);
    await user.save();
  }
  res.json({ token: signToken(user.id), user });
});
