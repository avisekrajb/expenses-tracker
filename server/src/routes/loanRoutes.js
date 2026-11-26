import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, summary, create, update, settle, remove } from "../controllers/loanController.js";

const router = Router();
router.use(auth);
router.get("/summary", summary); // must stay above "/:id"
router.get("/", list);
router.post("/", create);
router.put("/:id/settle", settle);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
