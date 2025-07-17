// src/services/mongo.ts (New Version)
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export function connect() {
  const connectionString = process.env.MONGO_URI;
  if (!connectionString) {
    console.error("Fatal: MONGO_URI environment variable is not set.");
    // process.exit(1); 
    return;
  }

  console.log("Attempting to connect to the provided MongoDB URI...");
  mongoose
    .connect(connectionString)
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch((error) => console.error("MongoDB connection error:", error));
}