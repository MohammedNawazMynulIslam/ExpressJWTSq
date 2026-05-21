import { Router } from "express";
import { issueController } from "../issues/issues.controller";
import { authController } from "./auth.controller";

const router = Router();
router.post("/signup", authController.registerUser); 
router.post("/login", authController.loginUser);
export const authRouter = router;