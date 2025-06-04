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
        <p>This is where a more detailed list or view of cooking history would go.</p>
        <p>For now, this is just a placeholder view to test routing.</p>
        <p><a href="/app">Back to Home</a></p>
        </div>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      .content-wrapper {
        padding: 1em;
      }
      h2 {
        color: var(--color-text-heading); 
        font-family: "Rowdies", sans-serif; 
        margin-bottom: 0.5em;
      }
    `
  ];
}