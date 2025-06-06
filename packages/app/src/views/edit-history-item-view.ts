// packages/app/src/views/edit-history-item-view.ts
import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { View, Form, History } from "@calpoly/mustang";
import { Model } from "../model";
import { Msg } from "../messages";
import { HistoryItem } from "server/models";
import resetStyles from "../styles/reset.css.js";

@customElement("edit-history-item-view")
export class EditHistoryItemViewElement extends View<Model, Msg> {
  @property({ attribute: "history-item-id" })
  historyItemId?: string;

  @state()
  private get _itemToEdit(): HistoryItem | undefined {
    return this.model.currentHistoryItem;
  }

  @state()
  private get _isLoading(): boolean {
    return this.model.isLoadingCurrentHistoryItem || false;
  }

  @state()
  private get _error(): string | undefined {
    return this.model.currentHistoryItemError;
  }

  constructor() {
    super("cooking:model");
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "history-item-id" && newValue && oldValue !== newValue) {
      this.dispatchMessage(["historyItem/fetchOne", { id: newValue }]);
    }
  }

  private _handleSubmit(event: Form.SubmitEvent<HistoryItem>) {
    if (!this.historyItemId) {
      console.error("Cannot save: historyItemId is undefined.");
      return;
    }

    const formData = event.detail;

    this.dispatchMessage([
      "historyItem/save",
      {
        id: this.historyItemId,
        data: formData,
        onSuccess: () => {
          History.dispatch(this, "history/navigate", { href: `/app/history` });
        },
        onFailure: (error: Error) => {
          console.error("Failed to save history item:", error);
          alert(`Save failed: ${error.message}`);
        }
      }
    ]);
  }

  override render() {
    if (this._isLoading) {
      return html`<p>Loading item data...</p>`;
    }

    if (this._error && !this._itemToEdit) {
      return html`
        <p class="error-message">Error: ${this._error}</p>
        <p><a href="/app/history">Back to History List</a></p>
      `;
    }

    if (!this._itemToEdit && !this._isLoading) {
      return html`
        <p>History item not found or could not be loaded.</p>
        <p><a href="/app/history">Back to History List</a></p>
      `;
    }

    return html`
      <main class="page-edit-item">
        <h2>Edit History Item: ${this._itemToEdit?.text || this.historyItemId}</h2>
        <mu-form
          .init=${this._itemToEdit}
          @mu-form:submit=${this._handleSubmit}
        >
          <label>
            <span>Link URL:</span>
            <input
              name="link"
              type="url"
              .value=${this._itemToEdit?.link || ""}
              required
            />
          </label>
          <label>
            <span>Text/Description:</span>
            <input
              name="text"
              type="text"
              .value=${this._itemToEdit?.text || ""}
              required
            />
          </label>
          <button type="submit">Save Changes</button>
        </mu-form>
      </main>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      .page-edit-item {
        padding: 1em;
        max-width: 600px;
        margin: 2em auto;
        background-color: var(--color-background-page);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: var(--color-text-heading);
        font-family: "Rowdies", sans-serif;
        margin-bottom: 1em;
        text-align: center;
      }
      mu-form {
        display: flex;
        flex-direction: column;
        gap: 1.5em;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        font-weight: bold;
        color: var(--color-text);
      }
      input[type="text"],
      input[type="url"] {
        padding: 0.75em;
        border: 1px solid var(--color-input-border, #ccc);
        border-radius: var(--radius-input, 4px);
        font-size: 1em;
      }
      button[type="submit"] {
        padding: 0.75em 1.5em;
        background-color: var(--color-button-primary-bg, var(--color-link));
        color: var(--color-button-primary-text, white);
        border: none;
        border-radius: var(--radius-button, 4px);
        cursor: pointer;
        font-size: 1em;
        font-weight: bold;
      }
      button[type="submit"]:hover {
        opacity: 0.9;
      }
      .error-message {
        color: var(--color-error-text, red);
        margin-top: 1em;
      }
    `
  ];
}
