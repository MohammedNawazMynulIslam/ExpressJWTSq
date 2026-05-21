import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthRequest } from "../../middleware/auth.js";
import { getErrorMessage, getErrorStatusCode } from "../../utils/appError.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/sendResponse.js";
import type { IIssue, IIssueQuery } from "./issue.interface.js";
import { issueService } from "./issue.servie.js";

type IssueIdParams = {
  id: string;
};

type CreateIssueBody = Pick<IIssue, "title" | "description" | "type">;
type UpdateIssueBody = Partial<CreateIssueBody>;

const createIssue = async (
  req: AuthRequest<unknown, CreateIssueBody>,
  res: Response,
) => {
  try {
    const reporterId = req.user!.id;
    const result = await issueService.createIssueIntoDB(req.body, reporterId);
    sendSuccessResponse(res, StatusCodes.CREATED, {
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: unknown) {
    sendErrorResponse(res, StatusCodes.BAD_REQUEST, getErrorMessage(error));
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  const query: IIssueQuery = {
    sort: req.query.sort as IIssueQuery["sort"] | undefined,
    type: req.query.type as IIssueQuery["type"] | undefined,
    status: req.query.status as IIssueQuery["status"] | undefined,
  };

  try {
    const result = await issueService.getAllIssuesFromDB(query);
    sendSuccessResponse(res, StatusCodes.OK, { data: result });
  } catch (error: unknown) {
    sendErrorResponse(
      res,
      getErrorStatusCode(error),
      getErrorMessage(error),
    );
  }
};

const getIssueById = async (req: Request<IssueIdParams>, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.getIssueByIdFromDB(id);

    if (!result) {
      return sendErrorResponse(res, StatusCodes.NOT_FOUND, "Issue not found");
    }

    return sendSuccessResponse(res, StatusCodes.OK, { data: result });
  } catch (error: unknown) {
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      getErrorMessage(error),
    );
  }
};

const updateIssue = async (
  req: AuthRequest<IssueIdParams, UpdateIssueBody>,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const result = await issueService.updateIssueInDB(id, req.body, req.user!);

    if (!result) {
      return sendErrorResponse(res, StatusCodes.NOT_FOUND, "Issue not found");
    }

    return sendSuccessResponse(res, StatusCodes.OK, {
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    return sendErrorResponse(
      res,
      getErrorStatusCode(error, StatusCodes.BAD_REQUEST),
      getErrorMessage(error),
    );
  }
};

const deleteIssue = async (
  req: AuthRequest<IssueIdParams>,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const result = await issueService.deleteIssueFromDB(id, req.user!);

    if (!result) {
      return sendErrorResponse(res, StatusCodes.NOT_FOUND, "Issue not found");
    }

    return sendSuccessResponse(res, StatusCodes.OK, {
      message: "Issue deleted successfully",
    });
  } catch (error: unknown) {
    return sendErrorResponse(
      res,
      getErrorStatusCode(error),
      getErrorMessage(error),
    );
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
