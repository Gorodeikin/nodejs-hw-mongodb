import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../utils/validateBody.js";
import {
  registerSchema,
  loginSchema
} from "../validation/authValidation.js";
import {
  registerController,
  loginController,
  refreshController,
  logoutController
} from "../controllers/auth.js";

const router = Router();

router.post("/register", validateBody(registerSchema), ctrlWrapper(registerController));
router.post("/login", validateBody(loginSchema), ctrlWrapper(loginController));
router.post("/refresh", ctrlWrapper(refreshController));
router.post("/logout", ctrlWrapper(logoutController));

export default router;
