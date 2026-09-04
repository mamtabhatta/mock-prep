import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (
    userId: string,
    role: string
) => {
    return jwt.sign(
        { userId, role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );
};

export const generateRefreshToken = (
    userId: string,
    rememberMe = false
) => {
    return jwt.sign(
        { userId },
        REFRESH_SECRET,
        {
            expiresIn: rememberMe ? "30d" : "7d"
        }
    );
};