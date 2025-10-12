//src/db/initMongoconnection.js

import mongoose from "mongoose";

export async function initMongoConnection() {
    try{
        const {
            MONGODB_USER,
            MONGODB_PASSWORD,
            MONGODB_URL,
            MONGODB_DB
        } = process.env;

        if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_URL || !MONGODB_DB) {
            throw new Error("Missing MongoDB environment variables");
          }

          const fullUrl = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

        await mongoose.connect(fullUrl);

        console.log("Mongo connection successfully established!");
    } catch (error) {
        console.error("Mongo connection error:", error.message);
        process.exit(1);
    }
}