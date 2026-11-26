import { Router } from "express";
import auth from "../middleware/auth.js";
import { signup, login, me } from "../controllers/authController.js";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, me);
export default router;
