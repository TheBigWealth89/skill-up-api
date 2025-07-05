import { hash, compare } from "bcrypt";
import crypto from "crypto";
import User from "../model/user.js";
import { security } from "../config/auth.config.js";
import {
  generateTokens,
  addToBlacklist,
  removeRefreshToken,
  verifyRefreshToken,
  saveRefreshToken,
} from "../utils/tokenUtils.js";
import config from "../config/config.js";
import RefreshToken from "../model/refreshToken.js";
import { LoginError } from "../error/customErrors.js";
import emailService from "../services/emailService.js";
/**
 *
 *
 * @class AuthController
 */
class AuthController {
  // Register user
  async signup(req, res, next) {
    const { firstName, lastName, username, email, password, avatar, roles } =
      req.body;
    try {
      if (!password || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
          errors: { password: "Password must be at least 8 characters" },
        });
      }

      const saltRound = 10;
      const hashedPassword = await hash(password, saltRound);

      const user = new User({
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        avatar,
        roles,
      });

      await user.save();
      try {
        await emailService.sendWelcomeEmail({
          email: user.email,
          name: user.firstName,
        });
      } catch (emailError) {
        //  Don't fail the signup if email fails
      }
      const userResponse = {
        _id: user._id,
        email: user.email,
        name: user.firstName,
        username: user.username,
        avatar: user.avatar,
      };

      res.status(201).json({
        user: userResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  //Login user

  async login(req, res, next) {
    const identifier =
      req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    try {
      if (!identifier || !password) {
        //Import custom error f rom errors folder
        throw new LoginError(
          "Username or Email and Password are required",
          400
        );
      }
      const cleanIdentifier = identifier.toLowerCase().trim();

      const user = await User.findOne({
        $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
      }).select("+password +failedLoginAttempts +lockUntil");

      // Timing attack-safe comparison
      const dummyHash = await hash("dummyHash", 10);
      if (!user) {
        //This ensures the compare function always runs, preventing timing attacks.
        await compare(password, dummyHash);
        throw new LoginError("Invalid credentials", 401);
      }

      if (user.lockUntil && user.lockUntil > new Date()) {
        const minutesLeft = Math.ceil(
          (user.lockUntil.getTime() - new Date().getTime()) / 60000
        );
        throw new LoginError(
          `Account locked due to too many attempts. Try again in ${minutesLeft} minutes`,
          403
        );
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= security.MAX_FAILED_ATTEMPTS) {
          user.lockUntil = new Date(
            Date.now() + security.LOCK_DURATION_TIME * 60 * 1000
          );
          user.isLocked = true;
          user.failedLoginAttempts = 0;
          await user.save();
          throw new LoginError(
            `Invalid credentials. Account locked for ${security.LOCK_DURATION_TIME} minutes`
          );
        }
        await user.save(); //Save changes

        throw new LoginError("Invalid credentials", 401);
      }
      //Handle correct password (Login Successful)
      //Reset login attempts and duration
      user.failedLoginAttempts = 0;
      user.lockUntil = null;

      // Generate tokens with proper expiration
      const tokens = generateTokens({ userId: user._id, roles: user.roles });

      await user.save(); // Save everything at once attempts reset + token

      await saveRefreshToken(user._id, tokens.refreshToken);

      // Set HTTP-only cookie
      res.cookie("refreshToken", tokens.refreshToken, config.jwt.cookieOptions);
      const name = { firstName: user.firstName, lastName: user.lastName };
      const loginResponse = {
        name: name,
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      };

      res.status(200).json({
        user: loginResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req, res) {
    // Track response
    let responseSent = false;

    const sendResponse = (status, data) => {
      if (!responseSent) {
        responseSent = true;
        return res.status(status).json(data);
      }
      return null;
    };

    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return sendResponse(401, { message: "Token missing" });
      }

      // Perform logout operations
      await addToBlacklist(token);

      // Remove the refresh token
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await removeRefreshToken(refreshToken);
        res.clearCookie("refreshToken");
      }

      // This will be the ONLY response
      return sendResponse(200, { message: "Successfully logged out" });
    } catch (err) {
      return sendResponse(500, {
        message: "Logout failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  //refresh
  async refresh(req, res) {
    console.log("--- [Backend /refresh] Request Received ---");
    const refreshTokenFromCookie = req.cookies.refreshToken;

    console.log("Refresh:", refreshTokenFromCookie);
    if (!refreshTokenFromCookie) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    try {
      //Verify THE PROVIDED TOKEN ONLY
      console.log("[Backend /refresh] SUCCESS: Found refreshToken cookie.");
      const decoded = await verifyRefreshToken(refreshTokenFromCookie);
      if (!decoded?.userId) {
        console.log(
          "[Backend /refresh] FAILED: verifyRefreshToken returned null. Token is invalid, expired, or was already used."
        );
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      //Generate new tokens
      const tokens = generateTokens({
        userId: decoded.userId,
        roles: decoded.roles,
      });

      //Save new refresh token (invalidates old one)
      await saveRefreshToken(decoded.userId, tokens.refreshToken);

      console.log(
        `[Backend /refresh] SUCCESS: Token verified for user ID: ${decoded.userId}`
      );
      //Set new cookie
      res.cookie("refreshToken", tokens.refreshToken, config.jwt.cookieOptions);

      return res.status(200).json({
        accessToken: tokens.accessToken,
        // refreshToken: tokens.refreshToken, // For clients that don't use cookies
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async forgotPassword(req, res, next) {
    try {
      //Find user email
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        try {
          // Construct the reset URL (adjust for your frontend)
          const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
          await emailService.sendPasswordResetEmail({
            email: user.email,
            name: user.firstName,
            url: resetURL,
          });

          res.status(200).json({
            status: "success",
            message: "Token sent to email!",
          });
        } catch (emailError) {
          // If email fails, reset the fields so user can try again later
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          await user.save({ validateBeforeSave: false });

          return next(
            new Error("There was an error sending the email. Try again later.")
          );
        }
      } else {
        //Even if user doesn't exist, send a success response
        // Prevents attackers from guessing which emails are registered.
        res.status(200).json({
          status: "success",
          message:
            "If an account with that email exists, a token has been sent.",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      // Get the token from the URL and hash it
      console.log("running ")
      const unhashedToken = req.params.token;
      const hashedToken = crypto
        .createHash("sha256")
        .update(unhashedToken)
        .digest("hex");

         console.log({
      step: "VERIFY",
      hashedToken_URL: hashedToken,
      currentTime: new Date(Date.now()),
    });

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() - 60 * 1000 }, // Check against 1 minute in the past
      }).select("+password +failedLoginAttempts +lockUntil +refreshToken"); // Select fields we need to modify
      //  If token is invalid or expired, send error
      if (!user) {
        throw new LoginError("Token is invalid or has expired.", 400);
      }

      const { password, passwordConfirm } = req.body;
      if (!password || !passwordConfirm || password !== passwordConfirm) {
        throw new LoginError("Passwords do not match or are missing.", 400);
      }

      const saltRound = 10;
      const hashedPassword = await hash(password, saltRound);
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.failedLoginAttempts = 0; // Reset lock status
      user.lockUntil = null;

      // Invalidate old refresh tokens (IMPORTANT SECURITY STEP)
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await removeRefreshToken(refreshToken);
        res.clearCookie("refreshToken");
      }

      await user.save();
      try {
        await emailService.sendSuccessPasswordResetEmail({
          email: user.email,
          name: user.firstName,
        });
      } catch (emailError) {
        return next(
          new Error("There was an error sending the email. Try again later.")
        );
      }

      res.status(200).json({
        status: "success",
        message: "Password reset successfully.",
        user: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new AuthController();
