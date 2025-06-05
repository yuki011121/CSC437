// packages/app/src/update.ts
import { Auth, Update } from "@calpoly/mustang";
import { Msg } from "./messages"; 
import { Model } from "./model";  
import { HistoryItem } from "server/models"; 

async function fetchHistory(user: Auth.User): Promise<HistoryItem[]> {
  const response = await fetch("/api/history", { 
    headers: Auth.headers(user)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Please log in to fetch history.");
    }
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }
  return response.json() as Promise<HistoryItem[]>;
}

export default function update(
  message: Msg,
  apply: Update.ApplyMap<Model>,
  user: Auth.User
): void {
  console.log("Update function received message:", message[0], "with payload:", message[1]);

  switch (message[0]) {
    case "history/load":
      if (!user.authenticated) {
        apply(model => ({
          ...model,
          historyError: "User not authenticated. Cannot load history.",
          isLoadingHistory: false
        }));
        break; 
      }

      apply(model => ({ ...model, isLoadingHistory: true, historyError: undefined }));

      fetchHistory(user)
        .then((items) => {
          apply(model => ({ 
            ...model, 
            historyItems: items, 
            isLoadingHistory: false 
          }));
        })
        .catch((err: Error) => {
          apply(model => ({ 
            ...model, 
            historyError: err.message, 
            isLoadingHistory: false 
          }));
        });
      break;

    case "history/loaded":
      break; 

    case "history/load-failed":
      break; 

    default:
      console.warn(`Unhandled message in update: ${message[0]}`);
      break;
  }
}