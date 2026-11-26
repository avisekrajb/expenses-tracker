import { Router } from "express";
import { adminGuard } from "../middleware/admin.js";
import { uploadLogo, uploadAnnouncementImage, uploadDonationQr } from "../middleware/upload.js";
import { requireFeature } from "../middleware/featureGate.js";
import {
  session, settings, saveSettings, logo, donationQr,
  requests, reviewRequest, overrides, revokeOverride, users,
  donations, reviewDonation,
  messages, reviewMessage, deleteMessage,
} from "../controllers/adminController.js";
import {
  adminList, create, remove,
} from "../controllers/announcementController.js";

const router = Router();
router.use(adminGuard);

router.get("/session", session);
router.get("/settings", settings);
router.put("/settings", saveSettings);
router.post("/logo", uploadLogo, logo);
router.post("/donation-qr", uploadDonationQr, donationQr);

router.get("/requests", requests);
router.post("/requests/:id/review", reviewRequest);
router.get("/overrides", overrides);
router.delete("/overrides/:id", revokeOverride);
router.get("/users", users);

router.get("/donations", donations);
router.post("/donations/:id/review", reviewDonation);

router.get("/messages", messages);
router.post("/messages/:id/review", reviewMessage);
router.delete("/messages/:id", deleteMessage);

const notificationsOn = requireFeature("notifications");
router.get("/announcements", adminList);
router.post("/announcements", notificationsOn, uploadAnnouncementImage, create);
router.delete("/announcements/:id", notificationsOn, remove);

export default router;
