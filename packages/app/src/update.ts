// packages/app/src/update.ts
import { Auth, Update } from "@calpoly/mustang";
import { Msg } from "./messages";
import { Model, Recipe } from "./model.js"; 
import { HistoryItem } from "server/models"; 

// async function loadSingleRecipe(id: string, user: Auth.User): Promise<any> {
//   if (!user.authenticated) throw new Error("User not authenticated.");
//   console.log(`UPDATE: loadSingleRecipe - Fetching /api/recipes/${id}`); 
//   const response = await fetch(`/api/recipes/${id}`, { headers: Auth.headers(user) }); 
//   if (!response.ok) {
//     throw new Error(`Failed to fetch recipe ${id}: Server responded with ${response.status}`);
//   }
//   return response.json();
// }
async function loadSingleRecipe(id: string, user: Auth.User): Promise<any> {
  console.log(`UPDATE: loadSingleRecipe - Fetching /api/recipes/${id}`);
  
  // We remove the "if (!user.authenticated)" check.
  // Auth.headers(user) will correctly add the token for logged-in users,
  // and will be empty for guests.
  const response = await fetch(`/api/recipes/${id}`, { headers: Auth.headers(user) });

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe ${id}: Server responded with ${response.status}`);
  }
  return response.json();
}

async function loadSingleHistoryItem(
  id: string,
  user: Auth.User
): Promise<HistoryItem> {
  if (!user.authenticated) {
    throw new Error("User not authenticated. Cannot load single history item.");
  }
  const response = await fetch(`/api/history/${id}`, {
    headers: Auth.headers(user) 
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

async function saveHistoryItem(
  id: string,
  data: Partial<HistoryItem>, 
  user: Auth.User
): Promise<HistoryItem> { 
  if (!user.authenticated) {
    throw new Error("User not authenticated. Cannot save history item.");
  }
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user) 
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
    throw new Error(`Failed to save history item ${id}: ${response.statusText}`);
  }
  return response.json() as Promise<HistoryItem>;
}

async function fetchHistory(user: Auth.User): Promise<HistoryItem[]> {
  if (!user.authenticated) {
    console.warn("fetchHistory called for unauthenticated user. Returning empty array.");
    return Promise.resolve([]);
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
      // For logged-in users, fetch from the server
      if (user.authenticated) {
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
      } else {
        // For guests, load from sessionStorage
        console.log("Guest mode: loading history from sessionStorage");
        const guestHistory = JSON.parse(sessionStorage.getItem("guest_history") || "[]");
        apply(model => ({
          ...model,
          historyItems: guestHistory,
          isLoadingHistory: false
        }));
      }
      break;
    case "historyItem/fetchOne":
      const { id: idToFetch } = message[1];
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
        currentHistoryItem: undefined
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
        apply(model => ({...model, currentHistoryItemError: authError.message }));
        break;
      }
      saveHistoryItem(idToSave, dataToSave, user)
        .then((savedItem) => {
          apply(model => {
            const updatedHistoryItems = model.historyItems?.map(item => 
              item._id === savedItem._id ? savedItem : item 
            );
            return {
              ...model,
              currentHistoryItem: savedItem, 
              historyItems: updatedHistoryItems || model.historyItems, 
              currentHistoryItemError: undefined 
            };
          });
          if (onSuccess) onSuccess();
        })
        .catch((err: Error) => {
          console.error("Error saving history item in update function:", err);
          apply(model => ({
            ...model,
            currentHistoryItemError: err.message
          }));
          if (onFailure) onFailure(err); 
        });
      break;

    case "history/loaded":
      console.log("Message 'history/loaded' received, but typically handled by 'history/load' success path now.");
      break;

    case "history/load-failed":
      console.log("Message 'history/load-failed' received, but typically handled by 'history/load' error path now.");
      break;

    case "historyItem/fetchedOne":
      break;
    case "historyItem/fetchOneFailed":
      break;
    case "historyItem/saved":
      break;
    case "historyItem/saveFailed":
      break;

    case "recipe/generate":
      const { ingredients } = message[1];

      if (!ingredients || ingredients.length === 0) {
        apply(model => ({ ...model, recipeGenerationError: "Please enter at least one ingredient." }));
        break;
      }

      apply(model => ({ 
        ...model, 
        isGeneratingRecipe: true, 
        recipeGenerationError: undefined,
        generatedRecipe: undefined 
      }));

      // For both guests and users, we generate the recipe.
      // The only difference is whether we send the auth header.
      fetch("/api/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Auth.headers adds the token if the user is authenticated,
          // otherwise it returns empty headers, which is perfect for guests.
          ...Auth.headers(user)
        },
        body: JSON.stringify({ ingredients })
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => Promise.reject(new Error(`API Error: ${text || res.statusText}`)));
        }
        return res.json();
      })
      .then((recipeData: Recipe) => {
        apply(model => ({
          ...model,
          isGeneratingRecipe: false,
          generatedRecipe: recipeData
        }));

        // After generating, decide where to save the history
        if (user.authenticated) {
          // Logged-in user: refresh history from the server
          return fetchHistory(user).then((historyItems) => {
            apply(model => ({ ...model, historyItems: historyItems }));
          });
        } else {
          // Guest: save a correctly structured history item to sessionStorage
          console.log("Guest mode: saving new, correctly structured recipe to sessionStorage");
          const guestHistory = JSON.parse(sessionStorage.getItem("guest_history") || "[]");
          
          // Create an object that matches the structure of a real HistoryItem
          const newGuestItem = {
            _id: `guest_${recipeData._id || Date.now()}`,
            text: ingredients.join(", "), // The text should be the ingredients list
            link: `/app/recipe/${recipeData._id}`, // The link to the new recipe detail page
            createdAt: new Date().toISOString()
          };

          guestHistory.unshift(newGuestItem);
          sessionStorage.setItem("guest_history", JSON.stringify(guestHistory));
          apply(model => ({ ...model, historyItems: guestHistory }));
        }

      })
      .catch((err: Error) => {
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
      loadSingleRecipe(id, user) 
        .then(recipe => {
          console.log("UPDATE: Successfully fetched single recipe:", recipe); 
          apply(model => ({ ...model, isLoadingRecipe: false, currentRecipe: recipe }));
        })
        .catch(err => {
          console.error("UPDATE: Failed to fetch single recipe:", err);
          apply(model => ({ ...model, isLoadingRecipe: false, recipeError: err.message }));
        });
      break;
    case "recipe/generated":
      const { recipe } = message[1] as { recipe: Recipe }; 
      console.log("Message handled: recipe/generated (state applied directly in generate handler)", recipe);
      // apply(model => ({ ...model, generatedRecipe: recipe, isGeneratingRecipe: false, recipeGenerationError: undefined }));
      break;

    case "recipe/generate-failed":
      console.log("Message handled: recipe/generate-failed (state applied directly in generate handler)");
      break;
    case "recipe/fetched":
      break;
    case "recipe/fetchFailed":
      break;
    case "recipe/rate":
      const { recipeId, rating } = message[1];
      if (!user.authenticated) {
        console.error("Cannot rate recipe: User not authenticated.");
        break;
      }
      fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...Auth.headers(user)
        },
        body: JSON.stringify({ rating: rating }) 
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save rating.");
        return res.json();
      })
      .then((updatedRecipe) => {
        apply(model => ({
          ...model,
          currentRecipe: model.currentRecipe?._id === updatedRecipe._id ? updatedRecipe : model.currentRecipe,
          generatedRecipe: model.generatedRecipe?._id === updatedRecipe._id ? updatedRecipe : model.generatedRecipe
        }));
      })
      .catch(err => {
        console.error("Rating submission failed:", err);
      });
      break;

    default:
      const unhandled: never = message[0];
      console.warn(`Unhandled message in update: ${unhandled}`);
      break;
  }
}