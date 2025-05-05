// src/history-list.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import './history-item.js'; 

interface HistoryItemData {
  link: string;
  text: string;
}

export class HistoryListElement extends LitElement {

  @property()
  src?: string;

  @state()
  private _historyItems: HistoryItemData[] = []; 

  override connectedCallback() {
    super.connectedCallback();
    if (this.src) {
       this.hydrate(this.src);
    } else {
        console.warn('HistoryListElement: src attribute is not set.');
    }
  }

  async hydrate(url: string) {
    try {
      const response = await fetch(url); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); 
      }
      const data = await response.json(); 

      if (Array.isArray(data)) {
        this._historyItems = data as HistoryItemData[]; 
      } else {
        console.error('HistoryListElement: Fetched data is not an array.', data);
        this._historyItems = []; 
      }
    } catch (error) {
      console.error('HistoryListElement: Failed to fetch or parse data.', error);
      this._historyItems = []; 
    }
  }

  override render() {
    if (!this._historyItems.length) {
      return html`<p>Loading history...</p>`; 
    }

    return html`
      <ul>
        ${this._historyItems.map(item => 
          html`
            <cook-history-item href="${item.link}">${item.text}</cook-history-item>
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
  `;
}