import { Contact } from "../models/contact.js";

export async function getAllContacts() {
  return Contact.find();
}

export async function getContactById(id) {
    return Contact.findById(id);
  }