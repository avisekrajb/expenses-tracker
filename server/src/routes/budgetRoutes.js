import { Router } from "express";
import auth from "../middleware/auth.js";
import { requireFeature } from "../middleware/featureGate.js";
import { getBudget, saveBudget, deleteBudget } from "../controllers/budgetController.js";

const router = Router();
router.use(auth);
const canEdit = requireFeature("budgets");
router.get("/:month", getBudget);
router.put("/:month", canEdit, saveBudget);
router.delete("/:month", canEdit, deleteBudget);
export default router;
