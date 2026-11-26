import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "./error.js";

export default function auth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    req.userId = verifyToken(header.startsWith("Bearer ") ? header.slice(7) : "").id;
    next();
  } catch {
    next(new HttpError(401, "Please log in again."));
  }
}
