// src/services/historyItem-svc.ts
import { Schema, model } from "mongoose";
import { HistoryItem } from "../models/historyItem";

const HistoryItemSchema = new Schema<HistoryItem>(
  {
    link: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { collection: "history_items" } 
);

const HistoryItemModel = model<HistoryItem>("HistoryItem", HistoryItemSchema);

function index(): Promise<HistoryItem[]> {
  return HistoryItemModel.find().exec();
}


function get(id: string): Promise<HistoryItem | null> {
  return HistoryItemModel.findById(id).exec();
}

function create(item: HistoryItem): Promise<HistoryItem> {
  const newItem = new HistoryItemModel(item); 
  return newItem.save(); 
}

function update(id: string, itemData: Partial<HistoryItem>): Promise<HistoryItem | null> {
  return HistoryItemModel.findByIdAndUpdate(id, itemData, { new: true }).exec();
}

function remove(id: string): Promise<HistoryItem | null> {
  return HistoryItemModel.findByIdAndDelete(id).exec();
}

export default { 
  index, 
  get,
  create,
  update,
  remove
};