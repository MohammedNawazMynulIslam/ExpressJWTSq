import type { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  message?: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  message: string;
};

export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number,
  payload: Omit<SuccessResponse<T>, "success">,
) =>
  res.status(statusCode).json({
    success: true,
    ...payload,
  });

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
) =>
  res.status(statusCode).json({
    success: false,
    message,
  } satisfies ErrorResponse);
