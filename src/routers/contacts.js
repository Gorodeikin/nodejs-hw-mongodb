//src/routers/contacts.js

import { Router } from "express";
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../utils/validateBody.js";
import { createContactSchema, updateContactSchema } from "../validation/contactValidation.js";
import { isValidId } from "../middlewares/isValidId.js";

const router = Router();

router.get("/", ctrlWrapper(getContactsController));
router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));
router.post("/", validateBody(createContactSchema), ctrlWrapper(createContactController));
router.patch("/:contactId", isValidId, validateBody(updateContactSchema), ctrlWrapper(updateContactController));
router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default router;
