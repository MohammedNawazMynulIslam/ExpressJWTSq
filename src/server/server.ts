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
            
            
            `


    } catch (error) {
        console.error("Error initializing database:", error);
    }
};




app.get("/", (req: Request, res: Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    message: "Hello World!",
  });
});

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, role, id } = req.body;
  res.status(201).json({
    message: "User registered successfully",
    data: {
      id,
      name,
      email,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
});

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});
