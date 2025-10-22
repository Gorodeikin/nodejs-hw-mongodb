import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";

const {
  JWT_SECRET = "replace_this_secret",
} = process.env;

const ACCESS_TOKEN_TTL = 15 * 60;
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60;

function signToken(payload, expiresInSeconds) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw createHttpError(409, "Email in use");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw createHttpError(401, "Invalid credentials");

  await Session.deleteMany({ userId: user._id });

  const accessToken = signToken({ userId: user._id }, ACCESS_TOKEN_TTL);
  const refreshToken = signToken({ userId: user._id }, REFRESH_TOKEN_TTL);

  const accessValidUntil = new Date(Date.now() + ACCESS_TOKEN_TTL * 1000);
  const refreshValidUntil = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: accessValidUntil,
    refreshTokenValidUntil: refreshValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
}

export async function refreshSession({ refreshToken, sessionId }) {
  const existing = await Session.findById(sessionId);
  if (!existing) throw createHttpError(401, "Invalid session");

  if (existing.refreshToken !== refreshToken) throw createHttpError(401, "Invalid refresh token");

  if (new Date() > existing.refreshTokenValidUntil) throw createHttpError(401, "Refresh token expired");

  const userId = existing.userId;

  await Session.deleteOne({ _id: existing._id });

  const accessToken = signToken({ userId }, ACCESS_TOKEN_TTL);
  const newRefreshToken = signToken({ userId }, REFRESH_TOKEN_TTL);

  const accessValidUntil = new Date(Date.now() + ACCESS_TOKEN_TTL * 1000);
  const refreshValidUntil = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

  const newSession = await Session.create({
    userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: accessValidUntil,
    refreshTokenValidUntil: refreshValidUntil,
  });

  return {
    accessToken,
    newRefreshToken,
    newSessionId: newSession._id,
  };
}

export async function logoutSession({ refreshToken, sessionId }) {
  const s = await Session.findById(sessionId);
  if (!s) return;
  if (s.refreshToken !== refreshToken) return;
  await Session.deleteOne({ _id: sessionId });
}