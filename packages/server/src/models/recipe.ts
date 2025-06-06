// packages/server/src/models/recipe.ts
export interface Recipe {
  _id?: string;
  name: string;
  description?: string;
  ingredientsUsed: string[];
  steps: string[];
  // 之后还可以添加创建时间、评分等
}