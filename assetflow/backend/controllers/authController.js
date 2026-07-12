import crypto from "crypto";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import generateToken from "../utils/generateToken.js";
import { asyncHandler } from "../middlewares/errorMiddleware.js";

// @desc  Register a new user - always as Employee. Admin promotes roles later.
// @route POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role: "Employee" });

  await ActivityLog.create({
    actor: user._id,
    action: "user.signup",
    message: `${user.name} joined AssetFlow`,
    entityType: "User",
    entityId: user._id,
    category: "General",
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc  Login
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.status === "Inactive") {
    res.status(403);
    throw new Error("Your account has been deactivated. Contact your admin.");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    token: generateToken(user._id),
  });
});

// @desc  Get logged-in user's profile
// @route GET /api/auth/me
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name");
  res.json(user);
});

// @desc  Forgot password - issues a reset token (email sending stubbed for demo)
// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Do not reveal whether the email exists
    return res.json({ message: "If that account exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save({ validateBeforeSave: false });

  // In production this is emailed via Nodemailer. For the demo we return it directly.
  res.json({
    message: "If that account exists, a reset link has been sent.",
    devResetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
  });
});

// @desc  Reset password using token
// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful. Please log in." });
});
