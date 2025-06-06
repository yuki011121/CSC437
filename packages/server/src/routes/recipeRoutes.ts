// packages/server/src/routes/recipeRoutes.ts
import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateUser } from "./auth"; // <<< 导入认证中间件
import RecipeService from "../services/recipe-svc"; // <<< 导入菜谱服务
import HistoryService from "../services/historyItem-svc"; 


// import { authenticateUser } from "./auth"; // 如果需要用户登录才能生成菜谱
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set in the .env file.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
const router = express.Router();

// POST /api/recipes/generate
// 接收: { ingredients: ["item1", "item2"] }
// 返回: { name: "菜谱名", steps: ["步骤1", "步骤2"], ingredientsUsed: ["item1", "item2"] }
router.post("/generate", (req: Request, res: Response) => {
  (async () => {
  const { ingredients } = req.body;
  const user = (req as any).user; // 获取用户信息

  if (!user || !user.username) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).send({ message: "Bad Request: 'ingredients' array is required." });
    }

    console.log("Backend: Received ingredients for Gemini:", ingredients);

    // --- 创建发送给 Gemini 的提示 (Prompt) ---
    // 让它扮演一个角色，并告诉它我们想要的输出格式 (JSON)
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

      try {
        // --- 1. 调用 Gemini API ---
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const recipeData = JSON.parse(text);

        // --- 2. 保存生成的菜谱到 'recipes' 集合 ---
        const savedRecipe = await RecipeService.create(recipeData);

        // --- 3. 创建并保存历史记录项到 'history_items' 集合 ---
        await HistoryService.create({
          userId: user.username,
          text: `Recipe for: ${ingredients.join(", ")}`, // 侧边栏显示的文本
          link: `/app/recipe/${savedRecipe._id}` // 指向新菜谱详情页的链接
        });

        res.status(200).json(savedRecipe); // 返回保存后的完整菜谱 (包含 _id)

      } catch (error) {
        console.error("Error in recipe generation/saving flow:", error);
        res.status(500).send({ message: "Failed to generate or save recipe." });
      }
  })();
});

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

export default router;