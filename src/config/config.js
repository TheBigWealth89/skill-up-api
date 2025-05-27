// import path from "path";
import dotenv from "dotenv";
dotenv.config();

// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate environment variables
const getRequiredEnv = (varName) => {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

export default {
  jwt: {
    // Required secrets (will throw error if missing)

    ACCESS_SECRET: getRequiredEnv("JWT_ACCESS_SECRET"),

    REFRESH_SECRET: getRequiredEnv("JWT_REFRESH_SECRET"),
    RESET_SECRET: getRequiredEnv("JWT_RESET_SECRET"),

    // Token expiration times
    jwt_access_expiry: process.env.JWT_ACCESS_EXPIRY || "15m",

    jwt_refresh_expiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    jwt_reset_expiry: process.env.JWT_RESET_EXPIRY || "1h",

    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    // Algorithm (recommended for production)
    // algorithm: process.env.JWT_ALGORITHM || "HS256",
  },
};
