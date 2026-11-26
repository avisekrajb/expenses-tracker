import { Router } from "express";
import auth from "../middleware/auth.js";
import { requireFeature } from "../middleware/featureGate.js";
import { list, summary, create, update, settle, remove } from "../controllers/loanController.js";

const router = Router();
router.use(auth);
const canEdit = requireFeature("loans");
router.get("/summary", summary); // must stay above "/:id"
router.get("/", list);
router.post("/", canEdit, create);
router.put("/:id/settle", canEdit, settle);
router.put("/:id", canEdit, update);
router.delete("/:id", canEdit, remove);
export default router;
