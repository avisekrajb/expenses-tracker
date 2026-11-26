import { Router } from "express";
import { cron } from "../controllers/notificationController.js";

const router = Router();
// Secured with CRON_SECRET by the controller; called by Vercel Cron.
router.get("/notify", cron);
export default router;
