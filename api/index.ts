import type { Request, Response } from "express";
import app from "../src/app.js";
import { initDB } from "../src/db/index.js";

const dbReady = initDB();

export default async function handler(req: Request, res: Response) {
  await dbReady;
  return app(req, res);
}
