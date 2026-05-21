import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendErrorResponse } from "../utils/sendResponse";

export type AuthUser = {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
};

export interface AuthRequest<
  Params = Record<string, string>,
  Body = unknown,
> extends Request<Params, unknown, Body> {
  user?: AuthUser;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "No token provided",
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    return sendErrorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired token",
    );
  }
};
