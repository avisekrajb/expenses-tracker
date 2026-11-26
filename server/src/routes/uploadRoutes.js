import { Router } from "express";
import auth from "../middleware/auth.js";
import { uploadReceipt } from "../middleware/upload.js";
import { uploadReceiptImage } from "../controllers/uploadController.js";

const router = Router();
router.use(auth);
router.post("/receipt", uploadReceipt, uploadReceiptImage);
export default router;
