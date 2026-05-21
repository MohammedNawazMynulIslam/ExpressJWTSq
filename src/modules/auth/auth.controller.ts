import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getErrorMessage } from "../../utils/appError.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";

type RegisterUserBody = {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
};

type LoginUserBody = {
  email: string;
  password: string;
};

const registerUser = async (
  req: Request<unknown, unknown, RegisterUserBody>,
  res: Response,
) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    sendSuccessResponse(res, StatusCodes.CREATED, {
      message: "User registered successfully",
      data: result,
    });
  } catch (error: unknown) {
    sendErrorResponse(res, StatusCodes.BAD_REQUEST, getErrorMessage(error));
  }
};

const loginUser = async (
  req: Request<unknown, unknown, LoginUserBody>,
  res: Response,
) => {
  const { email, password } = req.body;

  try {
    const result = await authService.loginUserFromDB({ email, password });
    sendSuccessResponse(res, StatusCodes.OK, {
      message: "Login successful",
      data: result,
    });
  } catch (error: unknown) {
    sendErrorResponse(res, StatusCodes.UNAUTHORIZED, getErrorMessage(error));
  }
};

export const authController = { registerUser, loginUser };
