//src/controllers/contacts.js

import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contacts.js";

export async function getContactsController(req, res) {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    sortOrder = "asc",
    type,
    isFavourite
  } = req.query;

  const parsedPage = Number(page) || 1;
  const parsedPerPage = Number(perPage) || 10;
  const parsedIsFavourite = typeof isFavourite !== "undefined" ? isFavourite === "true" : undefined;

  const result = await getAllContacts({
    page: parsedPage,
    perPage: parsedPerPage,
    sortBy,
    sortOrder,
    type,
    isFavourite: parsedIsFavourite
  });

  res.json({
    status: 200,
    message: "Successfully found contacts!",
    data: result
  });
}

export async function getContactByIdController(req, res) {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) throw createHttpError(404, "Contact not found");

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

export async function createContactController(req, res) {
  const contact = await createContact(req.body);
  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
}

export async function updateContactController(req, res) {
  const { contactId } = req.params;
  const updated = await updateContact(contactId, req.body);
  if (!updated) throw createHttpError(404, "Contact not found");

  res.json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updated,
  });
}

export async function deleteContactController(req, res) {
  const { contactId } = req.params;
  const deleted = await deleteContact(contactId);
  if (!deleted) throw createHttpError(404, "Contact not found");

  res.status(204).send();
}