//src/services/contacts.js

import { Contact } from "../models/contact.js";

export async function getAllContacts({ page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite, userId }) {
  const skip = (page - 1) * perPage;

  const filter = { userId };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== "undefined") filter.isFavourite = isFavourite;

  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [contacts, totalItems] = await Promise.all([
    Contact.find(filter).sort(sort).skip(skip).limit(perPage),
    Contact.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const safeContacts = page > totalPages ? [] : contacts;

  return {
    data: safeContacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1 && page <= totalPages,
    hasNextPage: page < totalPages,
  };
}

export async function getContactById(id, userId) {
  return Contact.findOne({ _id: id, userId });
}

export async function createContact(data) {
  return Contact.create(data);
}

export async function updateContact(id, data, userId) {
  return Contact.findOneAndUpdate({ _id: id, userId }, data, { new: true });
}

export async function deleteContact(id, userId) {
  return Contact.findOneAndDelete({ _id: id, userId });
}

