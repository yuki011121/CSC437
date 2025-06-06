// packages/app/src/messages.ts
import { HistoryItem } from "server/models"; 
// import { Recipe } from "../model"; 

export type Msg =
  | ["history/load"] 
  | ["history/loaded", { items: HistoryItem[] }] 
  | ["history/load-failed", { error: string }]

  | ["historyItem/fetchOne", { id: string }] 
  | ["historyItem/fetchedOne", { item: HistoryItem }] 
  | ["historyItem/fetchOneFailed", { id: string; error: string }]

  | [
      "historyItem/save",
      {
        id: string;                        
        data: Partial<HistoryItem>;         
        onSuccess?: () => void;            
        onFailure?: (error: Error) => void; 
      }
    ]
  | ["historyItem/saved", { item: HistoryItem }] 
  | ["historyItem/saveFailed", { id: string; error: string }]

  | ["recipe/generate", { ingredients: string[] }] 
  | ["recipe/generated", { recipe: any }]
  | ["recipe/generate-failed", { error: string }]
    | ["recipe/fetchById", { id: string }]
  | ["recipe/fetched", { recipe: any }] 
  | ["recipe/fetchFailed", { error: string }]
  | ["recipe/rate", { recipeId: string; rating: number }]
;