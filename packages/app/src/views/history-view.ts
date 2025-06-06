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

        <history-list></history-list> 

        <p style="margin-top: 2em;"><a href="/app">Back to Home</a></p>
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
        margin-bottom: 1em; /* 增加一点标题和列表之间的间距 */
      }
    `
  ];
}