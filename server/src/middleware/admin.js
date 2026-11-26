import auth from "./auth.js";
import { HttpError } from "./error.js";
import User from "../models/User.js";
import { ensureAdmin, isAdminEmail } from "../services/admin.js";

export async function requireAdmin(req, _res, next) {
  try {
    await ensureAdmin();
    const user = await User.findById(req.userId).select("email name");
    if (!user || !isAdminEmail(user.email)) throw new HttpError(403, "Admin access only.");
    req.admin = user;
    next();
  } catch (e) {
    next(e);
  }
}

export const adminGuard = [auth, requireAdmin];
