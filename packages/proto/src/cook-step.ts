// packages/proto/src/cook-step.ts
import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";

export class CookStepElement extends LitElement {
  static styles = css`
    li {
      padding: 0.5rem 1rem;
      background-color: var(--color-sidebar-background);
      border-left: 4px solid var(--color-sidebar-border);
      margin-bottom: 0.5rem;
      list-style: none;
    }
  `;

  override render() {
    return html`<li><slot name="step"></slot></li>`;
  }
}

customElements.define("cook-step", CookStepElement);
