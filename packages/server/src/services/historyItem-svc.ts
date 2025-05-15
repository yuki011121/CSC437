// src/services/historyItem-svc.ts
import { Schema, model } from "mongoose";
import { HistoryItem } from "../models/historyItem"; // Import our interface

// Define the Mongoose Schema for HistoryItem
const HistoryItemSchema = new Schema<HistoryItem>(
  {
    link: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { collection: "history_items" } // Name of the collection in MongoDB
);

// Create the Mongoose Model
// Mongoose will use the singular name "HistoryItem" to create a collection named "historyitems" 
// if the `collection` option in the schema is not set. We explicitly set it to "history_items".
const HistoryItemModel = model<HistoryItem>("HistoryItem", HistoryItemSchema);

// Service function to retrieve all history items
function index(): Promise<HistoryItem[]> {
  return HistoryItemModel.find().exec(); // .exec() ensures a true Promise is returned
}

// Service function to retrieve a single history item by its MongoDB _id
function get(id: string): Promise<HistoryItem | null> {
  return HistoryItemModel.findById(id).exec();
}

// (We will add create, update, delete functions in later labs)

export default { 
  index, 
  get 
};