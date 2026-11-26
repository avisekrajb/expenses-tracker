import { Router } from "express";
import auth from "../middleware/auth.js";
import { requireFeature } from "../middleware/featureGate.js";
import { list, create, update, remove, summary } from "../controllers/expenseController.js";

const router = Router();
router.use(auth);
const canEdit = requireFeature("expenses");
router.get("/summary", summary); // must stay above "/:id"
router.get("/", list);
router.post("/", canEdit, create);
router.put("/:id", canEdit, update);
router.delete("/:id", canEdit, remove);
export default router;
