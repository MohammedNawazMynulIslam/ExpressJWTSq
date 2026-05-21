import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/appError.js";
import { query as runQuery } from "../../utils/dbQuery.js";
import type { IIssue, IIssueQuery, IssueRequester } from "./issue.interface.js";

type ReporterRow = Pick<IIssue, "id" | "name" | "role">;

type IssueRow = Required<
  Pick<
    IIssue,
    | "id"
    | "title"
    | "description"
    | "type"
    | "status"
    | "reporter_id"
    | "created_at"
    | "updated_at"
  >
>;

const getReporterById = async (reporterId: number) => {
  const result = await runQuery<ReporterRow>(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [reporterId],
  );
  return result.rows[0] ?? null;
};

const createIssueIntoDB = async (
  payload: Pick<IIssue, "title" | "description" | "type">,
  reporterId: number,
) => {
  const { title, description, type } = payload;

  const result = await runQuery<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporterId],
  );

  return result.rows[0]!;
};


const getAllIssuesFromDB = async (issueQuery: IIssueQuery) => {
  const { sort, type, status } = issueQuery;

  if (sort && !["newest", "oldest"].includes(sort)) {
    throw new AppError("Invalid sort value", StatusCodes.BAD_REQUEST);
  }
  if (type && !["bug", "feature_request"].includes(type)) {
    throw new AppError("Invalid type value", StatusCodes.BAD_REQUEST);
  }
  if (status && !["open", "in_progress", "resolved"].includes(status)) {
    throw new AppError("Invalid status value", StatusCodes.BAD_REQUEST);
  }

  const sortOrder = sort === "oldest" ? "ASC" : "DESC"; 

  const conditions: string[] = [];
  const values: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await runQuery<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${whereClause}
     ORDER BY created_at ${sortOrder}, id ${sortOrder}`,
    values,
  );


  const issuesWithReporter = await Promise.all(
    result.rows.map(async (issue) => {
      const reporter = await getReporterById(issue.reporter_id);
      const { reporter_id, ...rest } = issue;
      return { ...rest, reporter };
    }),
  );

  return issuesWithReporter;
};


const getIssueByIdFromDB = async (id: string) => {
  const result = await runQuery<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) return null;


  const issue = result.rows[0]!;
  const reporter = await getReporterById(issue.reporter_id);
  const { reporter_id, ...rest } = issue;

  return { ...rest, reporter };
};

const updateIssueInDB = async (
  id: string,
  payload: Partial<Pick<IIssue, "title" | "description" | "type">>,
  requester: IssueRequester,
) => {
  const { title, description, type } = payload;

  if (!title && !description && !type) {
    throw new AppError(
      "At least one of title, description, or type is required",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (type && !["bug", "feature_request"].includes(type)) {
    throw new AppError("Invalid type value", StatusCodes.BAD_REQUEST);
  }

  const existingIssue = await runQuery<
    Pick<IssueRow, "id" | "reporter_id" | "status">
  >(
    `SELECT id, reporter_id, status FROM issues WHERE id = $1`,
    [id],
  );

  if (existingIssue.rows.length === 0) return null;

  const issue = existingIssue.rows[0]!;
  const isMaintainer = requester.role === "maintainer";
  const isOwnIssue = issue.reporter_id === requester.id;
  const isOpenIssue = issue.status === "open";

  if (!isMaintainer && !isOwnIssue) {
    throw new AppError(
      "You are not allowed to update this issue",
      StatusCodes.FORBIDDEN,
    );
  }

  if (!isMaintainer && !isOpenIssue) {
    throw new AppError(
      "Only open issues can be updated by contributors",
      StatusCodes.CONFLICT,
    );
  }

  const result = await runQuery<IssueRow>(
    `UPDATE issues
     SET title       = COALESCE($1, title),
         description = COALESCE($2, description),
         type        = COALESCE($3, type),
         updated_at  = NOW()
     WHERE id = $4
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, id],
  );

  return result.rows[0] ?? null;
};


const deleteIssueFromDB = async (id: string, requester: IssueRequester) => {
  if (requester.role !== "maintainer") {
    throw new AppError(
      "Only maintainers can delete issues",
      StatusCodes.FORBIDDEN,
    );
  }

  const result = await runQuery<Pick<IssueRow, "id">>(
    `DELETE FROM issues WHERE id = $1 RETURNING id`,
    [id],
  );

  return result.rows[0] ?? null; 
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};
