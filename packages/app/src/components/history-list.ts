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
    .history-item-entry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4em 0;
      border-bottom: 1px solid var(--color-sidebar-border);
    }
    .history-item-entry:last-child {
      border-bottom: none;
    }

    /* history-item 组件会渲染它自己的内容，我们让它占据主要空间 */
    history-item {
      flex-grow: 1; 
    }

    .edit-link {
      margin-left: 1em;
      padding: 0.2em 0.6em;
      border: 1px solid var(--color-link);
      color: var(--color-link); 
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
      transition: background-color 0.2s, color 0.2s;
    }
    .edit-link:hover {
      background-color: var(--color-link);
      color: var(--color-text-inverted);
    }
  `;
}