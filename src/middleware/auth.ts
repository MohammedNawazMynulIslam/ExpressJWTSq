
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config  } from "../config";
export interface AuthRequest extends Request {
  user?: { id: number; name: string; role: string };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: number;
      name: string;
      role: string;
    };
    req.user = decoded; 
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
