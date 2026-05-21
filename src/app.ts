// import express, {
//   type Application,
//   type Request,
//   type Response,
// } from "express";
// import { pool } from "./db";
// import { issueRouter } from "./modules/issues/issue.route";
// import { issueController } from "./modules/issues/issues.controller";
// import { authRouter } from "./modules/auth/auth.route";

// const app: Application = express();

// app.use(express.json());

// // registration user
// app.use("/api/auth", authRouter);

// // login user
// app.use("/api/auth", authRouter);

// // Create Issue
// app.use("/api/issues", issueRouter);

// // Get All Issues
// app.use("/api/issues", issueRouter);

// // Get Single Issue
// app.use("/api/issues/:id", issueRouter);

// // Update Issue
// app.use("/api/issues/:id", issueRouter);

// // Delete Issue
// app.use("/api/issues/:id", issueRouter);

// export default app;

import express, { type Application } from "express";
import { issueRouter } from "./modules/issues/issue.route";
import { authRouter } from "./modules/auth/auth.route";

const app: Application = express();

app.use(express.json());

app.use("/api/auth", authRouter); 
app.use("/api/issues", issueRouter);

export default app;