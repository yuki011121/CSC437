// src/history-item.ts
import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import reset from "./styles/reset.css.ts";

export class HistoryItemElement extends LitElement {

  @property()
  href = ""; 

  override render() {
    return html`
      <li>
        <a href="${this.href}">
          <slot></slot> </a>
      </li>
    `;
  }


  static styles = [
    reset, 
    css`
  
      li {
        list-style: none; 
        margin: 0; 
        padding: 0; 
      }
      a {
        color: var(--color-link); 
        text-decoration: none;
        display: block; 
        padding: 0.3em 0; 
      }
      a:hover {
        text-decoration: underline;
      }
    `
  ];
}