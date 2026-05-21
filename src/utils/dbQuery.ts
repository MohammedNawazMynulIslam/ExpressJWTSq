import type { QueryResult, QueryResultRow } from "pg";
import { pool } from "../db";

export const query = async <T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> => pool.query<T>(text, values);
