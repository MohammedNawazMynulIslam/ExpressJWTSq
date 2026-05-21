import type { Request, Response } from "express";
import { pool } from "../../db";
import { issueService } from "./issue.servie";

const createIssue = async (req: Request, res: Response) => {
  try {
   const result = await issueService.createIssueIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      error: error,
    });
  }
};
const getAllIssues = async (req: Request, res: Response) => {
  const sort = req.query.sort === "oldest" ? "ASC" : "DESC";

  try {
    const result = await issueService.getAllIssuesFromDB(req.body);
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
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

const getIssueById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getIssueByIdFromDB(String(id));
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0],
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

const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
      const result = await issueService.updateIssueInDB(String(id), 
         req.body
      );
        
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(String(id));
    if (result.rows.length === 0) {
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
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
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