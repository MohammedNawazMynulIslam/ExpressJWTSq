import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import {Pool} from "pg";
const app: Application = express();
const PORT = 7000;
app.use(express.json());

const pool = new Pool({
  connectionString:process.env.DB_URL,
});

const initDb = async () => {
    try { 
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Users table initialized successfully");
    } catch (error) {
        console.error("Error initializing users table:", error);
  }

   try {
     await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL CHECK (char_length(description) >= 20),
                type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
                reporter_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
     console.log("Issues table initialized successfully");
   } catch (error) {
     console.error("Error initializing issues table:", error);
   }

   try {
     await pool.query(`
            CREATE OR REPLACE FUNCTION set_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS set_users_updated_at ON users;
            CREATE TRIGGER set_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();

            DROP TRIGGER IF EXISTS set_issues_updated_at ON issues;
            CREATE TRIGGER set_issues_updated_at
            BEFORE UPDATE ON issues
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
        `);
     console.log("Timestamp triggers initialized successfully");
   } catch (error) {
     console.error("Error initializing timestamp triggers:", error);
   }
};


initDb()

app.get("/", (req: Request, res: Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    message: "Hello World!",
  });
});

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
 } catch (error:unknown) {
   res.status(500).json({
     success: true,
     message: error instanceof Error ? error.message : "An unexpected error occurred",
     error: error,
     
   });
 }

  
});

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});
