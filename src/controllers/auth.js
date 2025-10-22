import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { sendMail } from "../utils/mailer.js";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession,
} from "../services/auth.js";

const { JWT_SECRET, APP_DOMAIN } = process.env;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function registerController(req, res) {
  const { name, email, password } = req.body;
  const user = await registerUser({ name, email, password });

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user!",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

export async function loginController(req, res) {
  const { email, password } = req.body;
  const { accessToken, refreshToken, sessionId } = await loginUser({ email, password });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("sessionId", sessionId.toString(), cookieOptions);

  res.json({
    status: 200,
    message: "Successfully logged in an user!",
    data: { accessToken },
  });
}

export async function refreshController(req, res) {
  const { refreshToken, sessionId } = req.cookies || {};

  if (!refreshToken || !sessionId) {
    throw createHttpError(401, "No refresh token");
  }

  const { accessToken, newRefreshToken, newSessionId } = await refreshSession({ refreshToken, sessionId });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", newRefreshToken, cookieOptions);
  res.cookie("sessionId", newSessionId.toString(), cookieOptions);

  res.json({
    status: 200,
    message: "Successfully refreshed a session!",
    data: { accessToken },
  });
}

export async function logoutController(req, res) {
  const { refreshToken, sessionId } = req.cookies || {};

  if (!refreshToken || !sessionId) {
    res.clearCookie("refreshToken");
    res.clearCookie("sessionId");
    return res.status(204).send();
  }

  await logoutSession({ refreshToken, sessionId });

  res.clearCookie("refreshToken");
  res.clearCookie("sessionId");

  res.status(204).send();
}

export async function sendResetEmailController(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, "User not found!");

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "5m" });

  const frontendDomain = APP_DOMAIN || "http://localhost:3000/auth";
  const resetLink = `${frontendDomain.replace(/\/$/, "")}/reset-password?token=${token}`;

  const html = `<p>Hello ${user.name || "user"},</p>
<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 5 minutes.</p>`;

await sendMail({
  to: email,
  subject: "Reset your password",
  html,
  text: `Reset your password: ${resetLink}`,
});

  res.json({
    status: 200,
    message: "Reset password email has been successfully sent.",
    data: {},
  });
}

export async function resetPasswordController(req, res) {
  const { token, password } = req.body;

  const payload = jwt.verify(token, JWT_SECRET);
  const { email } = payload;
  if (!email) throw createHttpError(401, "Token is expired or invalid.");

  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, "User not found!");

  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.hash(password, 10);

  user.password = hashed;
  await user.save();

  await Session.deleteMany({ userId: user._id });

  res.json({
    status: 200,
    message: "Password has been successfully reset.",
    data: {},
  });
}