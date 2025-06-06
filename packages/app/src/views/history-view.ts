// packages/app/src/views/history-view.ts
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import resetStyles from "../styles/reset.css.js";


@customElement("history-view")
export class HistoryViewElement extends LitElement {
  override render() {
    return html`
      <div class="content-wrapper">
        <h2>My Cooking History</h2>
        <p class="info-text">
          Select an item from the history list on the left to view its details, or click 'Edit' to make changes.
        </p>
        <p class="info-text">
          To generate a new recipe, please navigate back <a href="/app">Home</a>.
        </p>
      </div>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      .content-wrapper {
        padding: 2em; /* 增加内边距 */
        text-align: center;
      }
      h2 {
        color: var(--color-text-heading); 
        font-family: "Rowdies", sans-serif; 
        margin-bottom: 1em;
      }
      .info-text {
        line-height: 1.6;
        margin-bottom: 1em;
        color: var(--color-text);
      }
      .info-text a {
        color: var(--color-link);
        font-weight: bold;
      }
    `
  ];
}