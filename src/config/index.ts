import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path: path.join(process.cwd(), ".env"),
});

export const config = {
    connectionString: process.env.DB_URL as string,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET as string,
}