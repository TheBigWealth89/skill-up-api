import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/tokenUtils";

export const authorization = async (
  req,
  res,
  next
) => {
  // Track if we've sent a response
  let responseSent = false;

  const sendResponse = (status, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(status).json(data);
    }
  };

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendResponse(401, { message: "Authorization header missing" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      sendResponse(401, { message: "Access token missing" });
      return;
    }

    const decoded = (await verifyAccessToken(token)) 

    if (!decoded) {
      sendResponse(401, { message: "Invalid token or blacklisted" });
    }
    req.user = decoded;

    // Only proceed if we haven't sent a response
    if (!responseSent) {
      next();
    }
  } catch (err) {
    if (responseSent) return;

    const message =
      err instanceof jwt.TokenExpiredError
        ? {
            message: "Token expired",
            expiredAt: (err).expiredAt,
          }
        : {
            message: "Invalid token",
            error: err instanceof Error ? err.message : "Unknown error",
          };

    sendResponse(401, message);
  }
};
