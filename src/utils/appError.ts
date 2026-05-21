import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = StatusCodes.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred";

export const getErrorStatusCode = (
  error: unknown,
  fallbackStatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
) => (error instanceof AppError ? error.statusCode : fallbackStatusCode);
