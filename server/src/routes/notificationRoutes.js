import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  config, subscribe, unsubscribe, list, test, check,
} from "../controllers/notificationController.js";

const router = Router();
router.get("/config", config);

router.use(auth);
router.post("/subscribe", subscribe);
router.delete("/unsubscribe", unsubscribe);
router.get("/subscriptions", list);
router.post("/test", test);
router.post("/check", check);

export default router;
