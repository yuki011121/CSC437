// packages/server/src/services/recipe-svc.ts
import { Schema, model } from "mongoose";
import { Recipe } from "../models/recipe";

const RecipeSchema = new Schema<Recipe>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  ingredientsUsed: [{ type: String, trim: true }],
  steps: [{ type: String, trim: true }]
}, { collection: "recipes" });

const RecipeModel = model<Recipe>("Recipe", RecipeSchema);

function create(recipe: Recipe): Promise<Recipe> {
  const newRecipe = new RecipeModel(recipe);
  return newRecipe.save();
}

function get(id: string): Promise<Recipe | null> {
  return RecipeModel.findById(id).exec();
}

export default { create, get };