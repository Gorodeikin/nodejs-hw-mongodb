import mongoose from "mongoose";

export async function initMongoConnection() {
    try{
        const fullUrl = `mongodb+srv://sergegorodeikin_db_user:OyrBZ1boSvi86yyH@cluster0.g5lkb98.mongodb.net/contacts_db?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(fullUrl);
        console.log("Mongo connection successfully established!");
    } catch (error) {
        console.error("Mongo connection error:", error.message);
        process.exit(1);
    }
}