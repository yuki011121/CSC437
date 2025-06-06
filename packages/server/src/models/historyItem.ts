// src/models/historyItem.ts
export interface HistoryItem {
  _id?: string; 
  userId: string;// MongoDB will automatically create an _id. We can add it here if we need to type it.
  link: string;
  text: string;
}