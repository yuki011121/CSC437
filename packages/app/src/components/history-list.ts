 // packages/app/src/components/history-list.ts

import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { View } from "@calpoly/mustang";
import { Model} from "../model";  
import { HistoryItem } from "server/models"  
import { Msg } from "../messages";      
import "./history-item.js"; 

@customElement("history-list") 
export class HistoryListElement extends View<Model, Msg> {

  constructor() {
    super("cooking:model"); 
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.model.historyItems && !this.model.isLoadingHistory) {
         this.dispatchMessage(["history/load"]);
    }
  }

  override render() {
    if (this.model.isLoadingHistory) {
      return html`<p>Loading history from store...</p>`;
    }

    if (this.model.historyError) {
      return html`<p class="error-message">Error: ${this.model.historyError}</p>`;
    }

    if (!this.model.historyItems || this.model.historyItems.length === 0) {
      return html`<p>No history items found in store.</p>`;
    }

    return html`
    <ul class="history-items-list">
      ${this.model.historyItems.map(
        (item: HistoryItem) => html`
          <li class="history-item-entry">
            <history-item href="${item.link}">${item.text}</history-item> 

            <a 
              href="/app/history/${item._id}/edit" 
              class="edit-link"
              title="Edit ${item.text}"
            >
              Edit
            </a>
          </li>
        `
      )}
    </ul>
    `;
  }

  static override styles = css`
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    p {
      padding: 0.5em 0;
      color: var(--color-text); 
    }
    .error-message {
      color: var(--color-error-text, red);
      padding: 0.5em 0;
    }
  `;
}