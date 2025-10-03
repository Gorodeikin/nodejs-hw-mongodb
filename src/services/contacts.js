//src/services/contacts.js

import { Contact } from "../models/contact.js";

export async function getAllContacts() {
  return Contact.find();
}

export async function getContactById(id) {
  return Contact.findById(id);
}

export async function createContact(data) {
  return Contact.create(data);
}

export async function updateContact(id, data) {
  return Contact.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteContact(id) {
  return Contact.findByIdAndDelete(id);
}
