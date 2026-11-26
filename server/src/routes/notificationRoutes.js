import { Router } from "express";
import auth from "../middleware/auth.js";
import { requireFeature } from "../middleware/featureGate.js";
import {
  config, subscribe, unsubscribe, list, test, check,
} from "../controllers/notificationController.js";

const router = Router();
router.get("/config", config);

router.use(auth);
const enabled = requireFeature("notifications");
router.post("/subscribe", enabled, subscribe);
router.delete("/unsubscribe", enabled, unsubscribe);
router.get("/subscriptions", list);
router.post("/test", enabled, test);
router.post("/check", check);

export default router;
