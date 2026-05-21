import { Router } from "express";
import { verifyToken } from "../../middleware/auth.js";
import { issueController } from "./issue.controller.js";
const router = Router();

router.post("/", verifyToken, issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.patch("/:id", verifyToken, issueController.updateIssue);
router.delete("/:id", verifyToken, issueController.deleteIssue);

export const issueRouter = router;
