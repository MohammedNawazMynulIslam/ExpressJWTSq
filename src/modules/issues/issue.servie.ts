import { pool } from "../../db";
import type { IIssue, IIssueQuery, IssueRequester } from "./issue.interface";

const getReporterById = async (reporterId: number) => {
  const result = await pool.query(
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

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title, description, type, reporterId],
  );

  return result.rows[0];
};


const getAllIssuesFromDB = async (query: IIssueQuery) => {
  const { sort, type, status } = query;

  if (sort && !["newest", "oldest"].includes(sort)) {
    throw new Error("Invalid sort value");
  }
  if (type && !["bug", "feature_request"].includes(type)) {
    throw new Error("Invalid type value");
  }
  if (status && !["open", "in_progress", "resolved"].includes(status)) {
    throw new Error("Invalid status value");
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

  const result = await pool.query(
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
  const result = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) return null;


  const issue = result.rows[0];
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
    throw new Error("At least one of title, description, or type is required");
  }

  if (type && !["bug", "feature_request"].includes(type)) {
    throw new Error("Invalid type value");
  }

  const existingIssue = await pool.query(
    `SELECT id, reporter_id, status FROM issues WHERE id = $1`,
    [id],
  );

  if (existingIssue.rows.length === 0) return null;

  const issue = existingIssue.rows[0];
  const isMaintainer = requester.role === "maintainer";
  const isOwnIssue = issue.reporter_id === requester.id;
  const isOpenIssue = issue.status === "open";

  if (!isMaintainer && (!isOwnIssue || !isOpenIssue)) {
    throw new Error("You are not allowed to update this issue");
  }

  const result = await pool.query(
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
    throw new Error("Only maintainers can delete issues");
  }

  const result = await pool.query(
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
