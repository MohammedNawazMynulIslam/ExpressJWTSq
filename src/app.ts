import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db";
import { issueRouter } from "./modules/issues/issue.route";


const app: Application = express();

app.use(express.json());






// registration user
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      `
    INSERT INTO users (name, email, password, role)
    VALUES ($1,$2,$3,$4) 
    RETURNING id, name, email, role, created_at, updated_at
    `,
      [name, email, password, role],
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: true,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      error: error,
    });
  }
});

// login user
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE email = $1 AND password = $2
      `,
      [email, password],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    res.status(200).json({
      success: true,
      message: "Login successful",
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
});

// Create Issue
app.use("/api/issues", issueRouter);

// Get All Issues
app.use("/api/issues", issueRouter);

// Get Single Issue
app.get("/api/issues/:id", issueRouter);

// Update Issue
app.patch("/api/issues/:id", issueRouter);

// Delete Issue
app.delete("/api/issues/:id", issueRouter);




export default app;
