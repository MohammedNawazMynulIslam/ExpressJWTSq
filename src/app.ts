import express, { type Application } from "express";
import { StatusCodes } from "http-status-codes";
import { authRouter } from "./modules/auth/auth.route.js";
import { issueRouter } from "./modules/issues/issue.route.js";
import { sendSuccessResponse } from "./utils/sendResponse.js";

const app: Application = express();

app.use(express.json());

app.get("/", (_req, res) => {
  sendSuccessResponse(res, StatusCodes.OK, {
    message: "DevPulse Issue Tracker API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

export default app;
