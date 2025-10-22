import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { Session } from "../models/session.js";
import { User } from "../models/user.js";

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function authenticate(req, res, next) {
  const auth = req.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return next(createHttpError(401, "No access token provided"));
  }
  const token = auth.split(" ")[1];
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createHttpError(401, "Access token expired"));
    }
    return next(createHttpError(401, "Invalid access token"));
  }

  const { userId } = payload;
  if (!userId) return next(createHttpError(401, "Invalid access token payload"));

  const session = await Session.findOne({ userId, accessToken: token });
  if (!session) return next(createHttpError(401, "Session not found"));
  if (new Date() > session.accessTokenValidUntil) return next(createHttpError(401, "Access token expired"));

  const user = await User.findById(userId).select("-password");
  if (!user) return next(createHttpError(401, "User not found"));

  req.user = user;
  req.session = session;
  next();
}