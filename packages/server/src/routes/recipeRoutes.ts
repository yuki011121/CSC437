// packages/server/src/routes/recipeRoutes.ts
import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { authenticateUser } from "./auth";
import { authenticateUser, tryAuthenticateUser } from "./auth";
import RecipeService from "../services/recipe-svc";
import HistoryService from "../services/historyItem-svc";

const router = express.Router();

// --- Gemini init ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Google Search init ---
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_CX      = process.env.GOOGLE_SEARCH_CX!;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
// ------------------------------------------------------------------
// POST /api/recipes/generate
// ------------------------------------------------------------------
router.post(
  "/generate",
  tryAuthenticateUser,                        
  (req: Request, res: Response) => {
    (async () => {
      const { ingredients } = req.body;
      const user = (req as any).user;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).send({ message: "Bad Request: 'ingredients' array is required." });
      }
      console.log("BACKEND: Received ingredients for Gemini:", ingredients);
      const prompt = `
        You are a creative chef. Based on the following ingredients, create a simple and delicious recipe.
        Ingredients: ${ingredients.join(", ")}

        Please respond with ONLY a valid JSON object, without any surrounding text or markdown formatting.
        The JSON object must have the following structure:
        {
          "name": "A creative name for the dish",
          "description": "A short, enticing description of the dish.",
          "ingredientsUsed": ["an", "array", "of", "the", "ingredients", "you", "actually", "used"],
          "steps": ["An array", "of strings", "where each string", "is a single step"]
        }
      `;

      console.log("BACKEND: 1. Calling Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanedText = response.text().replace(/```json|```/g, "").trim();
      const recipeData = JSON.parse(cleanedText);
      console.log("BACKEND: 2. Received recipe data from Gemini:", recipeData);

      let imageUrl = "";
      const query = encodeURIComponent(`${recipeData.name} food photo`);

      // 1. Try Google Custom Search
      if (GOOGLE_API_KEY && GOOGLE_CX) {
        try {
          const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${query}&searchType=image&num=5`;
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            const candidate = data.items?.find(
              (it: any) => it.mime?.startsWith("image/") && !/fbsbx\.com|googleusercontent\.com/.test(it.link)
            );
            if (candidate) imageUrl = candidate.link.replace(/^http:/, 'https');
          }
        } catch (e) {
          console.warn("Google Search API failed:", e);
        }
      }

      // 2. If Google fails, try Unsplash API (requires UNSPLASH_API_KEY in secrets)
      if (!imageUrl && process.env.UNSPLASH_API_KEY) {
        try {
          const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${process.env.UNSPLASH_API_KEY}`;
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            if (data.results && data.results.length > 0) {
              imageUrl = data.results[0].urls.regular;
            }
          }
        } catch (e) {
          console.warn("Unsplash API failed:", e);
        }
      }

      // 3. If all else fails, use a placeholder
      if (!imageUrl) {
        console.warn("All image sources failed, falling back to placeholder.");
        const placeholderText = encodeURIComponent(recipeData.name);
        imageUrl = `https://placehold.co/800x600/EFEFEF/AAAAAA?text=${placeholderText}`;
      }
      
      recipeData.imageUrl = imageUrl;

      console.log("BACKEND: 5. Attempting to save recipe to 'recipes' collection...");
      const savedRecipe = await RecipeService.create(recipeData);
      console.log("BACKEND: 6. Recipe saved successfully! ID:", savedRecipe._id);

      if (user && user.username) {
        await HistoryService.create({
          userId: user.username,
          text: ingredients.join(", "),
          link: `/app/recipe/${savedRecipe._id}`
        });
        console.log("BACKEND: 7.History item saved for user:", user.username);
      } else {
        console.log("BACKEND: 7. Guest generated a recipe. No history saved.");
      }

      res.status(200).json(savedRecipe);
      // let imageUrl = ""; 
      // if (GOOGLE_API_KEY && GOOGLE_CX && recipeData.name) {
      //   const q   = encodeURIComponent(`${recipeData.name} food photo`);
      //   const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${q}&searchType=image&num=5`;

      //   const r = await fetch(url);
      //   if (r.ok) {
      //     const data = await r.json();
      //     const candidate = data.items?.find(
      //       (it: any) =>
      //         it.mime?.startsWith("image/") &&
      //         !/fbsbx\.com|googleusercontent\.com/.test(it.link)  
      //     );
      //     if (candidate) imageUrl = candidate.link;
      //   }
      // }

      // if (!imageUrl && recipeData.name) {
      //   const q = encodeURIComponent(recipeData.name);
      //   imageUrl = `https://source.unsplash.com/800x600/?${q},food`;
      // }
      // recipeData.imageUrl = imageUrl; 

      // console.log("BACKEND: 5. Attempting to save recipe to 'recipes' collection...");
      // const savedRecipe = await RecipeService.create(recipeData);
      // console.log("BACKEND: 6. Recipe saved successfully! ID:", savedRecipe._id);

      // // await HistoryService.create({
      // //   userId: user.username,
      // //   text: ingredients.join(", "),
      // //   link: `/app/recipe/${savedRecipe._id}`
      // // });
      // // console.log("BACKEND: 7. History item saved successfully!");
      // if (user && user.username) {
      //   await HistoryService.create({
      //     userId: user.username,
      //     text: ingredients.join(", "),
      //     link: `/app/recipe/${savedRecipe._id}`
      //   });
      //   console.log("BACKEND: 7.History item saved for user:", user.username);
      // } else {
      //   console.log("BACKEND: 7. Guest generated a recipe. No history saved.");
      // }

      // res.status(200).json(savedRecipe);

    })().catch((error) => {
      console.error("BACKEND: ERROR during recipe generation flow:", error);
      res.status(500).send({ message: "Failed to generate or save recipe." });
    });
  }
);

router.get("/:id", tryAuthenticateUser, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const recipe = await RecipeService.get(id);
        if (!recipe) {
            res.status(404).send({ message: "Recipe not found." });
        } else {
            res.status(200).json(recipe);
        }
    } catch (error) {
        console.error("Error fetching recipe by ID:", error);
        res.status(500).send({ message: "Failed to fetch recipe." });
    }
});

router.put("/:id", authenticateUser, async (req: Request, res: Response) => {
  const { id } = req.params;
  const recipeDataToUpdate = req.body; 

  try {
    const updatedRecipe = await RecipeService.update(id, recipeDataToUpdate);
    if (!updatedRecipe) {
      res.status(404).send({ message: "Recipe not found for update." });
    } else {
      res.status(200).json(updatedRecipe);
    }
  } catch (error) {
    console.error("Error updating recipe by ID:", error);
    res.status(500).send({ message: "Failed to update recipe." });
  }
});

export default router;
