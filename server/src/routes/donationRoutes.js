import { Router } from "express";
import auth from "../middleware/auth.js";
import { create, mine, stats } from "../controllers/donationController.js";

const router = Router();
router.get("/stats", stats);
router.use(auth);
router.post("/", create);
router.get("/me", mine);

export default router;
