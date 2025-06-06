// packages/app/src/model.ts
import { HistoryItem as ServerHistoryItemOriginal } from "server/models";
export type HistoryItem = ServerHistoryItemOriginal;

export interface Recipe {
  name: string;
  description?: string;
  steps: string[];
  ingredientsUsed: string[];
  
}

export interface Model {
  historyItems?: HistoryItem[]; 
  isLoadingHistory?: boolean;
  historyError?: string;
  currentHistoryItem?: HistoryItem;         // 当前正在编辑或查看的单个历史项
  isLoadingCurrentHistoryItem?: boolean;  // 是否正在加载单个历史项
  currentHistoryItemError?: string;       // 加载或保存单个历史项时的错误信息

  // currentRecipe?: Recipe;
  // userProfile?: UserProfile;
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