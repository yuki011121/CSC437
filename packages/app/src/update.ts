// packages/app/src/update.ts
import { Auth, Update } from "@calpoly/mustang";
import { Msg } from "./messages";
import { Model, Recipe } from "./model.js"; 
import { HistoryItem } from "server/models"; // <<< 确保导入 HistoryItem

async function loadSingleRecipe(id: string, user: Auth.User): Promise<any> {
  if (!user.authenticated) throw new Error("User not authenticated.");
  console.log(`UPDATE: loadSingleRecipe - Fetching /api/recipes/${id}`); // <<< 确认 API 调用
  const response = await fetch(`/api/recipes/${id}`, { headers: Auth.headers(user) }); // 使用相对路径和认证头
  if (!response.ok) {
    throw new Error(`Failed to fetch recipe ${id}: Server responded with ${response.status}`);
  }
  return response.json();
}

// --- 辅助函数：加载单个历史记录项 ---
async function loadSingleHistoryItem(
  id: string,
  user: Auth.User
): Promise<HistoryItem> { // 这个函数应该返回获取到的 HistoryItem
  if (!user.authenticated) {
    throw new Error("User not authenticated. Cannot load single history item.");
  }
  // 使用 Vite 代理，所以是相对路径
  const response = await fetch(`/api/history/${id}`, {
    headers: Auth.headers(user) // Mustang 会自动添加 Bearer token
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Cannot load history item.");
    }
    if (response.status === 404) {
      throw new Error(`History item with ID '${id}' not found.`);
    }
    throw new Error(`Failed to load history item ${id}: ${response.statusText}`);
  }
  return response.json() as Promise<HistoryItem>;
}

// --- 辅助函数：保存/更新单个历史记录项 ---
async function saveHistoryItem(
  id: string,
  data: Partial<HistoryItem>, // 数据可以是部分的
  user: Auth.User
): Promise<HistoryItem> { // 这个函数应该返回更新后的 HistoryItem
  if (!user.authenticated) {
    throw new Error("User not authenticated. Cannot save history item.");
  }
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user) // 合并认证头
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized: Cannot save history item.");
    }
    if (response.status === 404) {
      throw new Error(`History item with ID '${id}' not found for update.`);
    }
    // 可以尝试解析错误响应体
    // const errorData = await response.json().catch(() => ({}));
    // throw new Error(`Failed to save history item ${id}: ${response.statusText} - ${errorData.message || ''}`);
    throw new Error(`Failed to save history item ${id}: ${response.statusText}`);
  }
  return response.json() as Promise<HistoryItem>;
}


// --- 已有的 fetchHistory 辅助函数 (用于加载历史列表) ---
async function fetchHistory(user: Auth.User): Promise<HistoryItem[]> {
  if (!user.authenticated) {
    // 在 MVU 中，通常我们不会在这里直接抛出，而是让 update 函数处理未认证状态
    // 或者，如果这个函数只应该在已认证时调用，那么调用者（update函数）应先检查认证状态
    // 返回一个空数组或特定错误对象可能更好，让 update 函数决定如何更新模型
    console.warn("fetchHistory called for unauthenticated user. Returning empty array.");
    return Promise.resolve([]); // 或者 throw new Error("User not authenticated for fetchHistory");
  }
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
  console.log("UPDATE function received message:", message[0], "with payload:", message[1]);

  switch (message[0]) {
    case "history/load":
      if (!user.authenticated) {
        apply(model => ({
          ...model,
          historyError: "User not authenticated. Cannot load history.",
          isLoadingHistory: false,
          historyItems: [] // 清空或设为 undefined
        }));
        break;
      }
      apply(model => ({ ...model, isLoadingHistory: true, historyError: undefined, historyItems: [] }));
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

    // --- 新增 Cases ---
    case "historyItem/fetchOne":
      const { id: idToFetch } = message[1]; // message[1] 是 payload { id: string }
      if (!user.authenticated) {
        apply(model => ({
          ...model,
          currentHistoryItemError: "User not authenticated.",
          isLoadingCurrentHistoryItem: false
        }));
        break;
      }
      apply(model => ({ 
        ...model, 
        isLoadingCurrentHistoryItem: true, 
        currentHistoryItemError: undefined,
        currentHistoryItem: undefined // 清除旧的
      }));
      loadSingleHistoryItem(idToFetch, user)
        .then((item) => {
          apply(model => ({
            ...model,
            currentHistoryItem: item,
            isLoadingCurrentHistoryItem: false
          }));
        })
        .catch((err: Error) => {
          apply(model => ({
            ...model,
            currentHistoryItemError: err.message,
            isLoadingCurrentHistoryItem: false
          }));
        });
      break;

    case "historyItem/save":
      const { id: idToSave, data: dataToSave, onSuccess, onFailure } = message[1];
      if (!user.authenticated) {
        const authError = new Error("User not authenticated. Cannot save item.");
        console.error(authError.message);
        if (onFailure) onFailure(authError);
        // 你也可以选择在这里通过 apply 更新模型的错误状态
        apply(model => ({...model, currentHistoryItemError: authError.message }));
        break;
      }
      // 可选：设置一个正在保存的状态
      // apply(model => ({ ...model, isSavingCurrentHistoryItem: true }));
      saveHistoryItem(idToSave, dataToSave, user)
        .then((savedItem) => {
          apply(model => {
            // 更新模型：更新列表中的对应项（如果存在）以及当前编辑项
            const updatedHistoryItems = model.historyItems?.map(item => 
              item._id === savedItem._id ? savedItem : item // 假设 HistoryItem 有 _id
            );
            return {
              ...model,
              currentHistoryItem: savedItem, // 更新当前正在编辑的项
              historyItems: updatedHistoryItems || model.historyItems, // 更新列表
              // isSavingCurrentHistoryItem: false,
              currentHistoryItemError: undefined // 清除错误
            };
          });
          if (onSuccess) onSuccess(); // 调用成功回调
        })
        .catch((err: Error) => {
          console.error("Error saving history item in update function:", err);
          apply(model => ({
            ...model,
            currentHistoryItemError: err.message
            // isSavingCurrentHistoryItem: false
          }));
          if (onFailure) onFailure(err); // 调用失败回调
        });
      break;

    // 你可以保留 history/loaded 和 history/load-failed 以备将来使用更细致的消息流，
    // 但鉴于 history/load 现在直接更新模型，它们当前不会被 history/load 触发。
    case "history/loaded":
      // const { items } = message[1];
      // apply(model => ({ ...model, historyItems: items, isLoadingHistory: false, historyError: undefined }));
      console.log("Message 'history/loaded' received, but typically handled by 'history/load' success path now.");
      break;

    case "history/load-failed":
      // const { error } = message[1];
      // apply(model => ({ ...model, historyError: error, isLoadingHistory: false }));
      console.log("Message 'history/load-failed' received, but typically handled by 'history/load' error path now.");
      break;

    case "historyItem/fetchedOne":
      // 目前未使用，保留以备将来扩展
      break;
    case "historyItem/fetchOneFailed":
      // 目前未使用，保留以备将来扩展
      break;
    case "historyItem/saved":
      // 目前未使用，保留以备将来扩展
      break;
    case "historyItem/saveFailed":
      // 目前未使用，保留以备将来扩展
      break;

    case "recipe/generate":
      const { ingredients } = message[1]; // 获取 payload 中的食材

      if (!user.authenticated) {
        apply(model => ({ ...model, recipeGenerationError: "Please sign in to generate a recipe." }));
        break;
      }
      if (!ingredients || ingredients.length === 0) {
         apply(model => ({ ...model, recipeGenerationError: "Please enter at least one ingredient." }));
         break;
      }

      // 1. 设置正在加载的状态
      apply(model => ({ 
        ...model, 
        isGeneratingRecipe: true, 
        recipeGenerationError: undefined,
        generatedRecipe: undefined // 清除旧的菜谱
      }));

      // 2. 调用后端 API
      fetch("/api/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",   // ← 这里
          ...Auth.headers(user)
        },
        body: JSON.stringify({ ingredients })
      })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`API Error: ${res.statusText}`)))
      .then((recipeData: Recipe) => {
        // 1. 更新模型，显示新生成的菜谱
        apply(model => ({
          ...model,
          isGeneratingRecipe: false,
          generatedRecipe: recipeData
        }));

        // 2. 返回 fetchHistory(user) 的 Promise，以刷新历史记录列表
        //    这形成了一个 Promise 链
        return fetchHistory(user); // <<< 新增：触发历史记录重新加载
      })
      .then((historyItems) => {
        // 3. fetchHistory 成功后，用新的历史记录列表更新模型
        apply(model => ({
          ...model,
          historyItems: historyItems,
          isLoadingHistory: false // 确保历史加载状态也更新
        }));
      })
      .catch((err: Error) => {
        // 统一处理 recipe/generate 或 history/load 的错误
        apply(model => ({
          ...model,
          isGeneratingRecipe: false,
          recipeGenerationError: err.message
        }));
      });
      break;
    case "recipe/fetchById":
      const { id } = message[1];
          apply(model => ({ ...model, isLoadingRecipe: true, recipeError: undefined, currentRecipe: undefined }));
      loadSingleRecipe(id, user) // loadSingleRecipe 是你之前创建的辅助函数
        .then(recipe => {
          console.log("UPDATE: Successfully fetched single recipe:", recipe); // <<< 确认收到数据
          apply(model => ({ ...model, isLoadingRecipe: false, currentRecipe: recipe }));
        })
        .catch(err => {
          console.error("UPDATE: Failed to fetch single recipe:", err); // <<< 确认是否有错误
          apply(model => ({ ...model, isLoadingRecipe: false, recipeError: err.message }));
        });
      break;
    case "recipe/generated":
      const { recipe } = message[1] as { recipe: Recipe }; // <<< ANNOTATE PAYLOAD HERE
      console.log("Message handled: recipe/generated (state applied directly in generate handler)", recipe);
      // apply(model => ({ ...model, generatedRecipe: recipe, isGeneratingRecipe: false, recipeGenerationError: undefined }));
      break;

    case "recipe/generate-failed":
      // 同样，这个消息的错误情况也已在 "recipe/generate" 的 Promise
      // 的 catch 中直接处理了。
      console.log("Message handled: recipe/generate-failed (state applied directly in generate handler)");
      break;
    case "recipe/fetched":
      // 目前未使用，保留以备将来扩展
      break;
    case "recipe/fetchFailed":
      // 目前未使用，保留以备将来扩展
      break;
    case "recipe/rate":
      const { recipeId, rating } = message[1];
      if (!user.authenticated) {
        console.error("Cannot rate recipe: User not authenticated.");
        // 可以选择性地在 model 中设置一个错误
        break;
      }

      // 调用后端 API 更新评分
      fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...Auth.headers(user)
        },
        body: JSON.stringify({ rating: rating }) // 只发送 rating 字段
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save rating.");
        return res.json();
      })
      .then((updatedRecipe) => {
        // 成功后，用后端返回的完整菜谱数据更新 model
        // 这样能确保前端状态与数据库完全同步
        apply(model => ({
          ...model,
          // 如果当前查看的菜谱就是被评分的这个，就更新它
          currentRecipe: model.currentRecipe?._id === updatedRecipe._id ? updatedRecipe : model.currentRecipe,
          // 同时也可以更新主页上显示的那个（如果它们是同一个状态属性）
          generatedRecipe: model.generatedRecipe?._id === updatedRecipe._id ? updatedRecipe : model.generatedRecipe
        }));
      })
      .catch(err => {
        console.error("Rating submission failed:", err);
        // 可以在 model 中设置一个错误状态来通知用户
        // apply(model => ({ ...model, recipeError: err.message }));
      });
      break;

    default:
      // 使用类型 never 进行穷尽性检查，确保所有消息都被处理
      const unhandled: never = message[0];
      console.warn(`Unhandled message in update: ${unhandled}`);
      // throw new Error(`Unhandled message: ${unhandled}`); // 在开发中可以取消注释以强制处理所有消息
      break;
  }
}