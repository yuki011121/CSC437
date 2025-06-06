// packages/app/src/views/home-view.ts
import { html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { View } from "@calpoly/mustang";
import { Model, Recipe } from "../model";
import { Msg } from "../messages";
import resetStyles from "../styles/reset.css.js";

@customElement("home-view")
export class HomeViewElement extends View<Model, Msg> {
  @state()
  private _ingredientsText = "";

  @state()
  private get _isLoading(): boolean {
    return this.model.isGeneratingRecipe || false;
  }

  @state()
  private get _error(): string | undefined {
    return this.model.recipeGenerationError;
  }

  @state()
  private get _recipe(): Recipe | undefined {
    return this.model.generatedRecipe;
  }

  constructor() {
    super("cooking:model");
  }

  private _handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this._ingredientsText = input.value;
  }

  private _handleGenerateRecipeClick() {
    if (!this._ingredientsText.trim()) {
      alert("Please enter some ingredients.");
      return;
    }
    const ingredients = this._ingredientsText.split(/[, ]+/).filter(Boolean);
    this.dispatchMessage(["recipe/generate", { ingredients }]);
  }

  override render() {
    return html`
      <div id="ingredients-input">
        <div class="section-title-with-icon">
          <h1>Enter Ingredients</h1>
          <svg class="icon-small"><use href="/icons/food.svg#icon-fork"></use></svg>
        </div>
        <div class="input-row">
          <input 
            type="text" 
            placeholder="e.g., chicken, tomato, potato"
            .value=${this._ingredientsText}
            @input=${this._handleInputChange}
            ?disabled=${this._isLoading}
          />
        </div>
        <p>
          <button
            @click=${this._handleGenerateRecipeClick}
            ?disabled=${this._isLoading || !this._ingredientsText}
            class="submit-button"
          >
            ${this._isLoading ? "Generating..." : "Submit Ingredients"}
          </button>
        </p>
      </div>

      <div id="recipe-suggestion">
        <h2>Suggested Recipe</h2>
        ${this._isLoading
          ? html`<p>Asking the AI chef... please wait...</p>`
          : this._error
            ? html`<p class="error-message">Error: ${this._error}</p>`
            : this._recipe
              ? html`
                  <h3>${this._recipe.name}</h3>
                  <p>Based on your ingredients: ${this._recipe.ingredientsUsed.join(', ')}</p>
                `
              : html`<p>Recipe will appear here after search.</p>`
        }
      </div>

      <div id="recipe-steps">
        <h2>Recipe Steps</h2>
        ${this._recipe
          ? html`
              <ol>
                ${this._recipe.steps.map((step: string) => html`
                  <li><cook-step><span slot="step">${step}</span></cook-step></li>
                `)}
              </ol>
            `
          : html`<p>Steps will appear here.</p>`
        }
      </div>

      <div id="bottom">
        <h2>Feedback</h2>
        <label for="rating-spa">Rate this recipe:</label>
        <input type="range" id="rating-spa" name="rating" min="1" max="5" step="1">
        <span>3/5</span>
      </div>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      :host {
        display: block;
        padding: 1rem 1.5rem;
      }
      .section-title-with-icon, #ingredients-input {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .input-row input {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--color-input-border);
        width: 70%;
        max-width: 400px;
        display: block; 
        margin: 0 auto 1rem auto;
      }
      .submit-button {
        padding: 0.75em 1.5em;
        background-color: var(--color-link);
        color: var(--color-text-inverted);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
      }
      .submit-button:disabled {
        background-color: #ccc;
      }
      #recipe-steps ol {
        padding-left: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      #recipe-suggestion, #recipe-steps, #bottom {
        margin-top: 1.5rem;
      }
      .error-message {
        color: var(--color-error-text, red);
      }
    `
  ];
}
