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

  @state()
  private _currentRatingValue: number = 3;

  @state()
  private _ratingSubmitted: boolean = false; 

  constructor() {
    super("cooking:model");
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('_recipe') && changedProperties.get('_recipe') !== this._recipe) {
      this._currentRatingValue = 3;
      this._ratingSubmitted = false;
    }
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
  private _handleRatingInput(event: Event) {
    const slider = event.target as HTMLInputElement;
    this._currentRatingValue = Number(slider.value);
  }

  private _submitRating() {
    if (!this._recipe || !this._recipe._id) {
      console.error("Cannot submit rating: No generated recipe with an ID is available.");
      return;
    }

    console.log(`Submitting rating: ${this._currentRatingValue} for recipe ID: ${this._recipe._id}`);
    this.dispatchMessage([
      "recipe/rate", 
      { recipeId: this._recipe._id, rating: this._currentRatingValue }
    ]);

    this._ratingSubmitted = true;
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
                  <div class="recipe-card">
                    ${this._recipe.imageUrl 
                      ? html`<img class="recipe-image"
+       src="${this._recipe.imageUrl}"
+      alt="${this._recipe.name}" />`
                      : ''}
                    <h3>${this._recipe.name}</h3>
                    <p>Based on your ingredients: ${this._recipe.ingredientsUsed.join(', ')}</p>
                  </div>
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
        ${this._recipe 
          ? html`
            <label for="rating-home">Rate this recipe:</label>
            <div class="rating-control">
              <input 
                type="range" 
                id="rating-home" 
                min="1" 
                max="5" 
                step="1"
                .value=${String(this._currentRatingValue)}
                @input=${this._handleRatingInput}
                ?disabled=${this._ratingSubmitted}
              >
              <span class="rating-value">${this._currentRatingValue}/5</span>
              <button 
                @click=${this._submitRating} 
                ?disabled=${this._ratingSubmitted}
                class="submit-rating-button"
              >
                ${this._ratingSubmitted ? "Submitted!" : "Submit Rating"}
              </button>
            </div>
          `
          : ''
        }
      </div>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      :host {
        display: block;
        padding: 2rem 3rem;
      }
      h2, h3 {
        color: var(--color-text-heading);
        font-family: "Rowdies", sans-serif;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      h3 {
        font-size: 1.2em; 
      }

      a {
        color: var(--color-link);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      #ingredients-input {
        margin-bottom: 2rem;
        text-align: center;
      }
      .section-title-with-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }
      .section-title-with-icon h1 { 
         color: var(--color-text-heading);
         font-family: "Rowdies", sans-serif;
         font-weight: 600;
         margin-bottom: 0.5rem;
      }
      .icon-small {
        height: 2em;
        width: 2em;
        vertical-align: middle;
        fill: currentColor;
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
        padding-left: 0; 
        list-style: none; 
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      #recipe-suggestion, #recipe-steps, #bottom {
        margin-top: 1.5rem;
      }
      .recipe-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;  
          display: block;
          margin: 0 auto 1em auto; 
          border-radius: 8px;
      }
      .recipe-card {
        text-align: center;
      }
      .rating-control {
        display: flex;
        align-items: center;
        gap: 1em;
        max-width: 500px;
        margin: auto;
      }
      .rating-control input[type="range"] {
        flex-grow: 1;
      }
      .rating-value {
        font-weight: bold;
        font-size: 1.2em;
        color: var(--color-text-heading);
        min-width: 40px; 
        text-align: center;
      }
      .submit-rating-button {
        padding: 0.5em 1em;
        border: 1px solid var(--color-link);
        color: var(--color-link);
        background-color: transparent;
        border-radius: 4px;
        cursor: pointer;
      }
      .submit-rating-button:hover:not([disabled]) {
        background-color: var(--color-link);
        color: var(--color-text-inverted);
      }
      .submit-rating-button:disabled {
        background-color: #eee;
        border-color: #ccc;
        color: #999;
        cursor: not-allowed;
      }
      .error-message {
        color: var(--color-error-text, red);
      }
    `
  ];
}
