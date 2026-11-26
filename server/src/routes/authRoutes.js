import { Router } from "express";
import auth from "../middleware/auth.js";
import { signup, login, me } from "../controllers/authController.js";
import { setup, enable, disable, verifyLogin } from "../controllers/twoFactorController.js";
import { requireFeature } from "../middleware/featureGate.js";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/2fa/verify", verifyLogin);

router.use(auth);
router.get("/me", me);
// Verification stays available so existing 2FA users are never locked out.
const canManage2FA = requireFeature("twoFactor");
router.post("/2fa/setup", canManage2FA, setup);
router.post("/2fa/enable", canManage2FA, enable);
router.post("/2fa/disable", canManage2FA, disable);

export default router;
