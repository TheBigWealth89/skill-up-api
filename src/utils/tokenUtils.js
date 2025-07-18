import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import RedisService from "../services/redisServices.js";
import RefreshToken from "../model/refreshToken.js";

//Generate (access + refresh)
export const generateTokens = (payload) => {
  if (!config.jwt.ACCESS_SECRET || !config.jwt.REFRESH_SECRET) {
    throw new Error("JWT secrets are missing");
  }

  // Ensure payload contains standard claims
  const fullPayload = {
    ...payload,
    iss: "BLOG", // Issuer
    iat: Math.floor(Date.now() / 1000), // Issued at
  };

  const accessTokenOptions = {
    expiresIn: "15m",
  };

  const refreshTokenOptions = {
    expiresIn: "7d",
  };

  const accessToken = jwt.sign(fullPayload, config.jwt.ACCESS_SECRET, {
    ...accessTokenOptions,
    algorithm: "HS256", // Explicitly set algorithm
  });

  const refreshToken = jwt.sign(
    payload,
    config.jwt.REFRESH_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

export const removeRefreshToken = async (refreshToken) => {
  const hashed = "TEST_" + hashedToken(refreshToken);
  return RefreshToken.deleteOne({ token: hashed });
};

export const verifyAccessToken = async (token) => {
  try {
    // Check if the token is blacklisted
    const isBlacklisted = await RedisService.isTokenBlacklisted(token);
    if (isBlacklisted === true) {
      throw new Error("Token has been blacklisted");
    }

    // Verify the token
    return jwt.verify(token, config.jwt.ACCESS_SECRET);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Token has been blacklisted", error.message);
    } else {
      throw new Error("Error verifying access token: ", error);
    }
    return null; // Return null if verification fails
  }
};

// Function hashed refresh token
const hashedToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const saveRefreshToken = async (userId, refreshToken) => {
  const hashed = hashedToken(refreshToken);
  // Delete ALL existing tokens for this user first
  await RefreshToken.deleteMany({ user: userId });
  // Create new token record
  return await RefreshToken.create({
    user: userId,
    token: "TEST_" + hashed,
  });
};
export const verifyRefreshToken = async (token) => {
  if (!token) {
    return null;
  }

  // First verify the JWT signature
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.REFRESH_SECRET);
  } catch (err) {
    return null;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hashed = "TEST_" + hashedToken(token);
    // Critical change: Only look for the exact token string provided
    const tokenDoc = await RefreshToken.findOneAndDelete(
      {
        token: hashed,
        user: payload.userId,
      },
      { session }
    );

    if (!tokenDoc) {
      await session.abortTransaction();
      return null;
    }

    await session.commitTransaction();
    return payload;
  } catch (err) {
    await session.abortTransaction();
    return null;
  } finally {
    session.endSession();
  }
};
//Add token to blacklist
export const addToBlacklist = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === "object" && "exp" in decoded) {
      const currentTime = Math.floor(Date.now() / 1000);
     
      const ttl = decoded.exp !== undefined ? decoded.exp - currentTime : 0;
      // console.log(
      //   "Token Expiry (exp):",
      //   new Date((decoded.exp || 0) * 1000).toISOString()
      // );
      // console.log("Calculated TTL:", ttl);
      if (ttl > 0) {
        await RedisService.blacklistToken(token, ttl);
      } else {
        console.log(
          "Token already expired or no expiry found, not blacklisting."
        );
      }
    }
  } catch (err) {
    throw err;
  }
};
