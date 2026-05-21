import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db";


const app: Application = express();

app.use(express.json());



app.get("/", (req: Request, res: Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    message: "Hello World!",
  });
});
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
app.post("/api/issues", async (req: Request, res: Response) => {
  const { title, description, type, reporter_id } = req.body;
  try {
    const result = await pool.query(
      `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1,$2,$3,$4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
      `,
      [title, description, type, reporter_id],
    );
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
});

// Get All Issues
app.get("/api/issues", async (req: Request, res: Response) => {
  const sort = req.query.sort === "oldest" ? "ASC" : "DESC";

  try {
    const result = await pool.query(
      `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      ORDER BY created_at ${sort}
      `,
    );
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
});

// Get Single Issue
app.get("/api/issues/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = $1
      `,
      [id],
    );
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
});

// Update Issue
app.patch("/api/issues/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, type, status } = req.body;
  try {
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
});

// Delete Issue
app.delete("/api/issues/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      DELETE FROM issues
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );
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
});




export default app;
