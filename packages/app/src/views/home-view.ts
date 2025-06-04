// packages/app/src/views/home-view.ts
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js"; 
import pageStyles from "../styles/page.css.ts";
import resetStyles from "../styles/reset.css.js"; 

@customElement("home-view") 
export class HomeViewElement extends LitElement {

  // API
  // @state()
  // private _suggestedRecipe?: object;

  // override connectedCallback() {
  //   super.connectedCallback();
  //   // this._loadData(); 
  // }

  // private async _loadData() {
  //   // fetch data logic here
  // }

  override render() {
    return html`
      <div id="ingredients-input">
        <div class="section-title-with-icon">
          <h1>Enter Ingredients</h1>
          <svg class="icon-small"><use href="/icons/food.svg#icon-fork"></use></svg>
        </div>
        <div class="input-row">
          <input type="text" placeholder="e.g., chicken, tomato">
        </div>
        <p><a href="#">Submit Ingredients (SPA - to be implemented)</a></p>
      </div>

      <div id="recipe-suggestion">
        <h2>Suggested Recipe</h2>
        <p>Recipe will appear here after search.</p>
      </div>

      <div id="recipe-steps">
        <h2>Recipe Steps</h2>
        <ol>
          <li><cook-step><span slot="step">Wash and chop ingredients.</span></cook-step></li>
          <li><cook-step><span slot="step">Heat oil in a pan.</span></cook-step></li>
          <li><cook-step><span slot="step">Add ingredients and stir-fry.</span></cook-step></li>
          <li><cook-step><span slot="step">Season to taste and serve hot.</span></cook-step></li>
        </ol>
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
    pageStyles,
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
      #recipe-steps ol {
        padding-left: 1.5rem; 
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
         gap: 1rem;
      }
       #recipe-suggestion, #recipe-steps, #bottom { 
         margin-top: 1.5rem;
       }
      /* @media (max-width: 768px) { ... } */
    `
  ];

}