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
    jwt_access_expiry: process.env.JWT_ACCESS_EXPIRY,

    jwt_refresh_expiry: process.env.JWT_REFRESH_EXPIRY,
    jwt_reset_expiry: process.env.JWT_RESET_EXPIRY,

    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    // Algorithm (recommended for production)
    // algorithm: process.env.JWT_ALGORITHM || "HS256",
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"), // Default to 587 for TLS
    secure:
      process.env.EMAIL_SECURE === "true" ||
      parseInt(process.env.EMAIL_PORT || "587") === 465, // true for 465, false otherwise
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      admin: process.env.ADMIN_EMAIL,
    },
    from: process.env.EMAIL_FROM || '"Skill up" <no-reply@youngdev.com>',
  },
};
