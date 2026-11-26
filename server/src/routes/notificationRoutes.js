import { Router } from "express";
import auth from "../middleware/auth.js";
import { requireFeature } from "../middleware/featureGate.js";
import {
  config, subscribe, unsubscribe, list, test, check,
} from "../controllers/notificationController.js";
import {
  listMine, unreadCount, markRead, markAllRead,
} from "../controllers/announcementController.js";

const router = Router();
router.get("/config", config);

router.use(auth);
const enabled = requireFeature("notifications");
router.post("/subscribe", enabled, subscribe);
router.delete("/unsubscribe", enabled, unsubscribe);
router.get("/subscriptions", list);
router.get("/announcements", listMine);
router.get("/announcements/unread-count", unreadCount);
router.post("/announcements/read-all", enabled, markAllRead);
router.post("/announcements/:id/read", enabled, markRead);
router.post("/test", enabled, test);
router.post("/check", check);

export default router;
