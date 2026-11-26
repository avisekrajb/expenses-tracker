import { Router } from "express";
import auth from "../middleware/auth.js";
import { uploadPhoto } from "../middleware/upload.js";
import { updateProfile, removePhoto } from "../controllers/authController.js";

const router = Router();
router.use(auth);
router.put("/me", uploadPhoto, updateProfile);
router.delete("/me/photo", removePhoto);
export default router;
