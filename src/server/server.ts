import express, {
  type Application,
  type Request,
  type Response,
} from "express";

const app: Application = express();
const PORT = 7000;
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

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
