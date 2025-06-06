// packages/server/src/models/recipe.ts
export interface Recipe {
  _id?: string;
  name: string;
  description?: string;
  ingredientsUsed: string[];
  imageUrl?: string; 
  rating?: number; 
  steps: string[];
}