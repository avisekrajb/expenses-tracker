import { Router } from "express";
import auth from "../middleware/auth.js";
import { uploadScreenshot } from "../middleware/upload.js";
import { requireFeature } from "../middleware/featureGate.js";
import { create, mine, stats } from "../controllers/donationController.js";

const router = Router();
router.get("/stats", stats);
router.use(auth);
router.post("/", uploadScreenshot, requireFeature("donations"), create);
router.get("/me", mine);

export default router;
