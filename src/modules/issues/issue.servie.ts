import { pool } from "../../db";
import type { Issue } from "./issue.interface";
import bcrypt from "bcrypt";

const createUserIntoDB = async (payload: Issue) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1,$2,$3,$4) 
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );
  return result;
};


const createIssueIntoDB = async (payload: Issue) => {
  const { title, description, type, reporter_id } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1,$2,$3,$4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
      `,
    [title, description, type, reporter_id],
  );
  return result;
};
const getAllIssuesFromDB = async (sort: "ASC" | "DESC") => {
  const result = await pool.query(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      ORDER BY created_at ${sort}
      `,
  );
  return result;
};

const getIssueByIdFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = $1
      `,
    [id],
  );
  return result;
};

const updateIssueInDB = async (id: string, payload: Issue) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
      UPDATE issues
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type),
          status = COALESCE($4, status)
      WHERE id = $5
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
      `,
    [title, description, type, status, id],
  );
  return result;
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
      `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getIssueByIdFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
  createUserIntoDB,
  
};
