// packages/app/src/model.ts
import { HistoryItem as ServerHistoryItemOriginal } from "server/models";
export type HistoryItem = ServerHistoryItemOriginal;

export interface Recipe {
  _id?: string;
  name: string;
  description?: string;
  steps: string[];
  imageUrl?: string; 
  rating?: number;
  ingredientsUsed: string[];
  
}

export interface Model {
  historyItems?: HistoryItem[]; 
  isLoadingHistory?: boolean;
  historyError?: string;
  currentHistoryItem?: HistoryItem;        
  isLoadingCurrentHistoryItem?: boolean;  
  currentHistoryItemError?: string;      

  generatedRecipe?: Recipe;
  isGeneratingRecipe?: boolean;
  recipeGenerationError?: string;
  currentRecipe?: Recipe;
  isLoadingRecipe?: boolean;
  recipeError?: string;
}

export const init: Model = {
  historyItems: [],
  isLoadingHistory: false,
  historyError: undefined,
  currentHistoryItem: undefined,
  isLoadingCurrentHistoryItem: false,
  currentHistoryItemError: undefined,
  generatedRecipe: undefined,
  isGeneratingRecipe: false,
  recipeGenerationError: undefined,
  currentRecipe: undefined,
  isLoadingRecipe: false,
  recipeError: undefined
};