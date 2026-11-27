import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (userId) => jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: "30d" });
export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
