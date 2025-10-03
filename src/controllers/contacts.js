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
  const contacts = await getAllContacts();
  res.json({ status: 200, message: "Successfully found contacts!", data: contacts });
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

