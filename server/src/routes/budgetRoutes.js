import { Router } from "express";
import auth from "../middleware/auth.js";
import { getBudget, saveBudget, deleteBudget } from "../controllers/budgetController.js";

const router = Router();
router.use(auth);
router.get("/:month", getBudget);
router.put("/:month", saveBudget);
router.delete("/:month", deleteBudget);
export default router;
