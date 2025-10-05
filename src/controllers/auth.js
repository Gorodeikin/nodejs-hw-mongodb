import createHttpError from "http-errors";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession
} from "../services/auth.js";

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
