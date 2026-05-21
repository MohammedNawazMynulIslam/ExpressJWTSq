import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { AppError } from "../../utils/appError.js";
import { query } from "../../utils/dbQuery.js";

type UserRole = "contributor" | "maintainer";

type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

type LoginUserPayload = {
  email: string;
  password: string;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

type UserResponse = Omit<UserRow, "password">;

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role = "contributor" } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query<UserResponse>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );

  return result.rows[0]!;
};

const loginUserFromDB = async (payload: LoginUserPayload) => {
  const { email, password } = payload;
  const userData = await query<UserRow>(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  const user = userData.rows[0];

  if (!user) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

  const { password: _password, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

export const authService = { registerUserIntoDB, loginUserFromDB };
