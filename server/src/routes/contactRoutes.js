import { Router } from "express";
import { details, submit } from "../controllers/contactController.js";

const router = Router();
router.get("/details", details);
router.post("/", submit);

export default router;
