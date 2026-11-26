import { Router } from "express";
import { adminGuard } from "../middleware/admin.js";
import { uploadLogo } from "../middleware/upload.js";
import {
  session, settings, saveSettings, logo,
  requests, reviewRequest, overrides, revokeOverride, users,
  donations, reviewDonation,
  messages, reviewMessage, deleteMessage,
} from "../controllers/adminController.js";

const router = Router();
router.use(adminGuard);

router.get("/session", session);
router.get("/settings", settings);
router.put("/settings", saveSettings);
router.post("/logo", uploadLogo, logo);

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

export default router;
