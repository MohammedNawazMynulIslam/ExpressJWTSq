import type { Request, Response } from "express";
import { issueService } from "./issue.servie";
import type { AuthRequest } from "../../middleware/auth";
import type { IIssueQuery } from "./issue.interface";



const createIssue = async (req: AuthRequest, res: Response) => {
  try {
    const reporterId = req.user!.id;
    const result = await issueService.createIssueIntoDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  const sort = req.query.sort as IIssueQuery["sort"] | undefined;
  const type = req.query.type as IIssueQuery["type"] | undefined;
  const status = req.query.status as IIssueQuery["status"] | undefined;

  const query: IIssueQuery = {
    sort,
    type,
    status,
  };

  try {
    const result = await issueService.getAllIssuesFromDB(query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

const getIssueById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getIssueByIdFromDB(String(id));
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    res.status(200).json({
      success: true,
      
      data: result,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      error: error,
    });
  }
};

const updateIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.updateIssueInDB(
      String(id),
      req.body,
      req.user!,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    const statusCode = message === "You are not allowed to update this issue" ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      message,
      error: error,
    });
  }
};

const deleteIssue = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(String(id), req.user!);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    const statusCode = message === "Only maintainers can delete issues" ? 403 : 500;

    res.status(statusCode).json({
      success: false,
      message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,

};
