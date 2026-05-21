import { Router } from "express";
import { issueController } from "./issue.controller";
import { verifyToken } from "../../middleware/auth"; 
const router = Router();

router.post("/", verifyToken, issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.patch("/:id", verifyToken, issueController.updateIssue);
router.delete("/:id", verifyToken, issueController.deleteIssue);

export const issueRouter = router;
