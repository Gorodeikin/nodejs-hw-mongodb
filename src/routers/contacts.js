//src/routers/contacts.js

import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from "../controllers/contacts.js";
import { authenticate } from "../middlewares/authenticate.js";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.use(authenticate);

router.get("/", ctrlWrapper(getContactsController));

router.get("/:contactId", ctrlWrapper(getContactByIdController));

router.post(
  "/",
  upload.single("photo"),
  ctrlWrapper(createContactController)
);

router.patch(
  "/:contactId",
  upload.single("photo"),
  ctrlWrapper(updateContactController)
);

router.delete("/:contactId", ctrlWrapper(deleteContactController));

export default router;
