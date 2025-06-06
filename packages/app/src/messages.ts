// packages/app/src/messages.ts
import { HistoryItem } from "server/models"; 
// import { Recipe } from "../model"; 

export type Msg =
  | ["history/load"] 
  | ["history/loaded", { items: HistoryItem[] }] 
  | ["history/load-failed", { error: string }]

  // View -> Store: 请求加载单个历史记录项以供编辑
  | ["historyItem/fetchOne", { id: string }] 
  // Store -> Model (或 update函数内部处理): 单个历史记录项加载成功
  | ["historyItem/fetchedOne", { item: HistoryItem }] 
  // Store -> Model (或 update函数内部处理): 单个历史记录项加载失败
  | ["historyItem/fetchOneFailed", { id: string; error: string }]

  // View -> Store: 请求保存（更新）一个历史记录项
  | [
      "historyItem/save",
      {
        id: string;                         // 要更新的项的 ID
        data: Partial<HistoryItem>;         // 更新的数据 (Partial表示可以是部分字段)
        onSuccess?: () => void;             // 可选的成功回调 (例如，用于导航)
        onFailure?: (error: Error) => void; // 可选的失败回调 (例如，显示错误)
      }
    ]
  // Store -> Model (或 update函数内部处理): 历史记录项保存成功
  | ["historyItem/saved", { item: HistoryItem }] 
  // Store -> Model (或 update函数内部处理): 历史记录项保存失败
  | ["historyItem/saveFailed", { id: string; error: string }]

    // View -> Store: 请求根据食材生成一个菜谱
  | ["recipe/generate", { ingredients: string[] }] 
  // Store -> Model (或内部处理): 菜谱生成成功
  | ["recipe/generated", { recipe: any }] // recipe 的类型可以是 Recipe 接口
  // Store -> Model (或内部处理): 菜谱生成失败
  | ["recipe/generate-failed", { error: string }]
    | ["recipe/fetchById", { id: string }]
  | ["recipe/fetched", { recipe: any }] // 使用 any 或 Recipe 接口
  | ["recipe/fetchFailed", { error: string }]
;