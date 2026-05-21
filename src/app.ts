import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db";
import { issueRouter } from "./modules/issues/issue.route";
import { issueController } from "./modules/issues/issues.controller";


const app: Application = express();

app.use(express.json());






// registration user
app.use("/api/auth/signup", issueRouter);

// login user
app.use("/api/auth/login", issueRouter);

// Create Issue
app.use("/api/issues", issueRouter);

// Get All Issues
app.use("/api/issues", issueRouter);

// Get Single Issue
app.get("/api/issues/:id", issueRouter);

// Update Issue
app.patch("/api/issues/:id", issueRouter);

// Delete Issue
app.delete("/api/issues/:id", issueRouter);




export default app;
