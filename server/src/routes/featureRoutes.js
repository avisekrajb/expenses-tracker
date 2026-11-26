import { Router } from "express";
import auth from "../middleware/auth.js";
import { mine, requestFeature, cancelRequest } from "../controllers/featureController.js";

const router = Router();
router.use(auth);
router.get("/mine", mine);
router.post("/request", requestFeature);
router.delete("/request/:id", cancelRequest);

export default router;
