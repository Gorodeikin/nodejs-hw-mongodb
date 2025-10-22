import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../utils/validateBody.js";
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
  resetPwdSchema
} from "../validation/authValidation.js";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  sendResetEmailController,
  resetPasswordController
} from "../controllers/auth.js";

const router = Router();

router.post("/register", validateBody(registerSchema), ctrlWrapper(registerController));
router.post("/login", validateBody(loginSchema), ctrlWrapper(loginController));
router.post("/refresh", ctrlWrapper(refreshController));
router.post("/logout", ctrlWrapper(logoutController));

router.post("/send-reset-email", validateBody(sendResetEmailSchema), ctrlWrapper(sendResetEmailController));
router.post("/reset-pwd", validateBody(resetPwdSchema), ctrlWrapper(resetPasswordController));

export default router;