import { Router } from "express";
import auth from "../middleware/auth.js";
import { signup, login, me } from "../controllers/authController.js";
import { setup, enable, disable, verifyLogin } from "../controllers/twoFactorController.js";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/2fa/verify", verifyLogin);

router.use(auth);
router.get("/me", me);
router.post("/2fa/setup", setup);
router.post("/2fa/enable", enable);
router.post("/2fa/disable", disable);

export default router;
