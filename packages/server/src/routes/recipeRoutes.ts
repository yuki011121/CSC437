// packages/server/src/routes/recipeRoutes.ts
import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateUser } from "./auth";
import RecipeService from "../services/recipe-svc";
import HistoryService from "../services/historyItem-svc";

const router = express.Router();

// --- Gemini init ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Google Search init ---
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY!;
const GOOGLE_CX      = process.env.GOOGLE_SEARCH_CX!;

// ------------------------------------------------------------------
// POST /api/recipes/generate
// ------------------------------------------------------------------
router.post(
  "/generate",
  authenticateUser,                            // ← 推荐把 auth 放中间件里
  (req: Request, res: Response) => {
    (async () => {
      const { ingredients } = req.body;
      const user = (req as any).user;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).send({ message: "Bad Request: 'ingredients' array is required." });
      }
      console.log("BACKEND: Received ingredients for Gemini:", ingredients);
      // 1. 让 Gemini 生成菜谱 --------------------------------------------------
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

      // --- 1. 调用 Gemini API 获取菜谱文本 ---
      console.log("BACKEND: 1. Calling Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      // 有时 Gemini 会返回带 markdown 格式的 JSON，我们需要清理一下
      const cleanedText = response.text().replace(/```json|```/g, "").trim();
      const recipeData = JSON.parse(cleanedText);
      console.log("BACKEND: 2. Received recipe data from Gemini:", recipeData);


      // --- 2. 新增：根据菜谱名称搜索图片 ---
      let imageUrl = ""; // 默认空图片 URL
      if (GOOGLE_API_KEY && GOOGLE_CX && recipeData.name) {
        const q   = encodeURIComponent(`${recipeData.name} food photo`);
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${q}&searchType=image&num=5`;

        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          const candidate = data.items?.find(
            (it: any) =>
              it.mime?.startsWith("image/") &&
              !/fbsbx\.com|googleusercontent\.com/.test(it.link)   // 排除 Facebook / data-URI
          );
          if (candidate) imageUrl = candidate.link;
        }
      }

      /* 兜底：Unsplash 随机图（免 key、免登录） */
      if (!imageUrl && recipeData.name) {
        const q = encodeURIComponent(recipeData.name);
        imageUrl = `https://source.unsplash.com/800x600/?${q},food`;
      }
      recipeData.imageUrl = imageUrl; // 将图片 URL 添加到菜谱数据中，无论是否为空

      
      // --- 3. 保存带图片的完整菜谱到数据库 ---
      console.log("BACKEND: 5. Attempting to save recipe to 'recipes' collection...");
      const savedRecipe = await RecipeService.create(recipeData);
      console.log("BACKEND: 6. Recipe saved successfully! ID:", savedRecipe._id);

      // --- 4. 创建并保存历史记录项 ---
      await HistoryService.create({
        userId: user.username,
        text: ingredients.join(", "),
        link: `/app/recipe/${savedRecipe._id}`
      });
      console.log("BACKEND: 7. History item saved successfully!");

      res.status(200).json(savedRecipe);

    })().catch((error) => {
      console.error("BACKEND: ERROR during recipe generation flow:", error);
      res.status(500).send({ message: "Failed to generate or save recipe." });
    });
  }
);// ←←← ① 结束 router.post

// ------------------------------------------------------------------
router.get("/:id", authenticateUser, async (req: Request, res: Response) => {
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
  // req.body 中可能只包含 rating，或者其他要更新的字段
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
