import { Router } from "express";
import auth from "../middleware/auth.js";
import { uploadReceipt } from "../middleware/upload.js";
import { requireFeature } from "../middleware/featureGate.js";
import { uploadReceiptImage } from "../controllers/uploadController.js";

const router = Router();
router.use(auth);
router.post("/receipt", requireFeature("receipts"), uploadReceipt, uploadReceiptImage);
export default router;
