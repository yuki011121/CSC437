// packages/app/src/components/history-list.ts
import { LitElement, html, css } from 'lit';
// import { property, state } from 'lit/decorators.js';
import { state } from 'lit/decorators.js';
import { Observer, Auth } from "@calpoly/mustang"; 
import './history-item.js'; 

interface HistoryItemData {
  link: string;
  text: string;
  _id?: string; 
}

export class HistoryListElement extends LitElement {

  @state()
  private _historyItems: HistoryItemData[] = []; 

  @state()
  private _error?: string; 

  @state()
  private _isLoading = true; 

  private _authObserver = new Observer<Auth.Model>(this, "cooking:auth"); 
  private _user?: (Auth.User & { token?: string }); 

  private get _authorization(): HeadersInit | undefined {
    if (this._user?.authenticated && this._user.token) { 
      return { Authorization: `Bearer ${this._user.token}` };
    }
    return undefined; 
  }
  
  override connectedCallback() {
    super.connectedCallback();
    this._authObserver.observe((authModel: Auth.Model) => {
      this._user = authModel.user;
      if (this._user?.authenticated) {
        this._loadHistory(); 
      } else {
        this._historyItems = [];
        this._error = "Please sign in to view history.";
        this._isLoading = false;
      }
    });

  }
  private async _loadHistory() {
    this._isLoading = true;
    this._error = undefined;
    // const apiUrl = "http://localhost:3000/api/history"; 
    const apiUrl = "/api/history";

    try {
      const response = await fetch(apiUrl, { 
        headers: this._authorization
      });

      if (response.status === 401 || response.status === 403) {
        this._error = "Unauthorized: Please sign in to view history.";
        this._historyItems = [];
        this._isLoading = false;
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        this._historyItems = data as HistoryItemData[];
      } else {
        console.error('HistoryListElement: Fetched data is not an array.', data);
        this._error = "Failed to load history: Invalid data format.";
        this._historyItems = [];
      }
    } catch (error: any) {
      console.error('HistoryListElement: Failed to fetch history data.', error);
      this._error = error.message || "Failed to load history.";
      this._historyItems = [];
    } finally {
      this._isLoading = false;
    }
  }

  override render() {
    if (this._isLoading) {
      return html`<p>Loading history...</p>`;
    }
    if (this._error) {
      return html`<p class="error-message">${this._error}</p>`;
    }
    if (!this._historyItems.length && !this._error) {
      return html`<p>No history items found.</p>`;
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
    .error-message {
      color: var(--color-error-text, red);
      padding: 0.5em 0;
    }
  `;
}