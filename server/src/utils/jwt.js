import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (userId) => jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: "30d" });
// Short-lived token used only between password login and the 2FA code check.
export const signChallenge = (userId) => jwt.sign({ id: userId, purpose: "2fa" }, env.JWT_SECRET, { expiresIn: "5m" });
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
export const verifyChallenge = (token) => {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (payload.purpose !== "2fa") throw new Error("Invalid 2FA challenge.");
  return payload;
};
