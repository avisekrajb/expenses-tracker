import { asyncHandler, HttpError } from "./error.js";
import { effectiveFeatures } from "../services/admin.js";

// Disabled features stay readable so existing data is never lost; only changes
// are blocked until an admin turns the feature back on or approves the user.
export const requireFeature = (key) => asyncHandler(async (req, _res, next) => {
  const features = await effectiveFeatures(req.userId);
  if (features[key] === false) {
    throw new HttpError(403, "This feature is currently off. Ask the admin to enable it for you.");
  }
  next();
});
