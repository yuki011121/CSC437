// packages/app/src/model.ts
import { HistoryItem } from "server/models"; 

export interface Model {
  historyItems?: HistoryItem[]; 
  isLoadingHistory?: boolean;
  historyError?: string;


  // currentRecipe?: Recipe;
  // userProfile?: UserProfile;
}

export const init: Model = {
  historyItems: [],
  isLoadingHistory: false,
  historyError: undefined
};