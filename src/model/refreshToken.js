import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Automatically remove documents after 7 days
  }
});


const refreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default refreshToken
