// packages/app/src/messages.ts
import { HistoryItem } from "server/models"; 

export type Msg =
  | ["history/load"] 
  | ["history/loaded", { items: HistoryItem[] }] 
  | ["history/load-failed", { error: string }]
;