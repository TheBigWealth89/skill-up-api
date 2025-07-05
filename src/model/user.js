import mongoose from "mongoose";
import crypto from "crypto";
export const ROLES = {
  learner: "learner",
  instructor: "instructor",
  admin: "admin",
};
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "Name is required"] },
    lastName: { type: String, required: [true, "Name is required"] },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Username is required"],
      unique: [true, "Username already taken"],
      minlength: [3, "Username must be at least 3 characters"],
      validate: {
        validator: (v) => /^[a-zA-Z0-9]+$/.test(v),
        message: "No special characters allowed in username",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    roles: {
      type: [String],
      enum: Object.values(ROLES),
      default: [ROLES.learner],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    avatar: { type: String, default: "" },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Method to generate a password reset token
userSchema.methods.createPasswordResetToken = function () {
  //  Generate the raw token (this is what you send in the email)
  const resetToken = crypto.randomBytes(32).toString("hex");

  //  Hash the token (this is what  store in the DB)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  ``;

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // console.log({ resetToken, hashed: this.passwordResetToken }); // For debugging
console.log({
    step: "CREATE",
    hashedToken_DB: this.passwordResetToken,
    expiresAt_DB: new Date(this.passwordResetExpires),
  });
  //  Return the raw token (to be sent via email)
  return resetToken;
};

userSchema.pre("save", function (next) {
  // Example: Maybe you have logic that tries to *derive* isLocked?
  if (this.lockUntil && this.lockUntil > new Date()) {
    this.isLocked = true;
  } else {
    this.isLocked = false; // <-- !! This could be overwriting the 'true' !!
  }
  next();
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
