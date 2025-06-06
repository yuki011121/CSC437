// packages/app/src/views/recipe-detail-view.ts
import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { View } from "@calpoly/mustang";
import { Model, Recipe } from "../model";
import { Msg } from "../messages";
import resetStyles from "../styles/reset.css.js";

@customElement("recipe-detail-view")
export class RecipeDetailViewElement extends View<Model, Msg> {
  @property({ attribute: "recipe-id" })
  recipeId?: string;

  @state()
  get _recipe(): Recipe | undefined {
    return this.model.currentRecipe;
  }

  @state()
  get _isLoading(): boolean {
    return this.model.isLoadingRecipe || false;
  }

  @state()
  get _error(): string | undefined {
    return this.model.recipeError;
  }

  constructor() {
    super("cooking:model");
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "recipe-id" && newValue && oldValue !== newValue) {
      this.dispatchMessage(["recipe/fetchById", { id: newValue }]);
    }
  }

  override render() {
    if (this._isLoading) {
      return html`<p>Loading recipe details...</p>`;
    }
    if (this._error) {
      return html`<p class="error-message">Error: ${this._error}</p>`;
    }
    if (!this._recipe) {
      return html`<p>Recipe not found.</p>`;
    }

    return html`
      <article class="recipe-details">
        <h2>${this._recipe.name}</h2>
        <p class="description">${this._recipe.description}</p>

        <h3>Ingredients Used:</h3>
        <ul class="ingredient-list">
          ${this._recipe.ingredientsUsed.map((ing) => html`<li>${ing}</li>`)}
        </ul>

        <h3>Steps:</h3>
        <ol class="steps-list">
          ${this._recipe.steps.map((step) => html`<li>${step}</li>`)}
        </ol>

        <p class="back-link-container">
          <a href="/app/history" class="back-link">Back to History</a>
        </p>
      </article>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      .recipe-details {
        padding: 1em;
      }

      h2,
      h3 {
        color: var(--color-text-heading);
        font-family: "Rowdies", sans-serif;
      }

      h3 {
        margin-top: 1em;
      }

      .ingredient-list,
      .steps-list {
        margin-left: 1.5em;
      }

      .description {
        font-style: italic;
        margin-bottom: 1em;
      }
      .back-link-container {
        text-align: center;
        margin-top: 2em; /* 增加与上方内容的间距 */
      }
      .back-link {
        display: inline-block; /* 让 padding 生效 */
        padding: 0.5em 1.5em;
        border: 1px solid var(--color-link);
        color: var(--color-link);
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        transition: background-color 0.2s, color 0.2s;
      }
      .back-link:hover {
        background-color: var(--color-link);
        color: var(--color-text-inverted);
      }
      .error-message {
        color: var(--color-error-text, red);
      }
    `,
  ];
}
