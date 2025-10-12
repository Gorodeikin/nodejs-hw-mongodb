//src/controllers/contacts.js

import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contacts.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

// GET /contacts
export async function getContactsController(req, res) {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    sortOrder = "asc",
    type,
    isFavourite,
  } = req.query;

  const parsedPage = Number(page) || 1;
  const parsedPerPage = Number(perPage) || 10;
  const parsedIsFavourite =
    typeof isFavourite !== "undefined" ? isFavourite === "true" : undefined;
  const userId = req.user._id;

  const result = await getAllContacts({
    page: parsedPage,
    perPage: parsedPerPage,
    sortBy,
    sortOrder,
    type,
    isFavourite: parsedIsFavourite,
    userId,
  });

  res.json({
    status: 200,
    message: "Successfully found contacts!",
    data: result,
  });
}

// GET /contacts/:contactId
export async function getContactByIdController(req, res) {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await getContactById(contactId, userId);
  if (!contact) throw createHttpError(404, "Contact not found");

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}


// POST /contacts
export async function createContactController(req, res) {
  const userId = req.user._id;
  const data = { ...req.body, userId };

  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, "contacts");
      data.photo = result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw createHttpError(
        500,
        "Failed to upload photo, please try again later."
      );
    }
  }

  const contact = await createContact(data);
  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
}

// PATCH /contacts/:contactId
export async function updateContactController(req, res) {
  const { contactId } = req.params;
  const userId = req.user._id;
  const updateData = { ...req.body };

  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, "contacts");
      updateData.photo = result.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw createHttpError(
        500,
        "Failed to upload photo, please try again later."
      );
    }
  }

  const updated = await updateContact(contactId, updateData, userId);
  if (!updated) throw createHttpError(404, "Contact not found");

  res.json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updated,
  });
}

// DELETE /contacts/:contactId
export async function deleteContactController(req, res) {
  const { contactId } = req.params;
  const userId = req.user._id;

  const deleted = await deleteContact(contactId, userId);
  if (!deleted) throw createHttpError(404, "Contact not found");

  res.status(204).send();
}
