// packages/proto/src/cook-header.ts
import { html, css, LitElement } from "lit";
import { state } from "lit/decorators.js"; 
import { Observer, Auth, Events } from "@calpoly/mustang";
import resetStyles from "../styles/reset.css.js";

export class CookHeaderElement extends LitElement {
  private _authObserver = new Observer<Auth.Model>(this, "cooking:auth");

  @state()
  private _loggedIn = false;

  @state()
  private _userid?: string;

  @state()
  private _isDarkMode = false; 

  override connectedCallback() {
    super.connectedCallback();
    this._authObserver.observe((authModel: Auth.Model) => {
      const user = authModel.user;
      this._loggedIn = user?.authenticated || false;
      this._userid = user?.username;
    });

  }

  private _handleDarkModeToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this._isDarkMode = checkbox.checked;
    const darkModeEvent = new CustomEvent("darkmode:toggle", {
      bubbles: true, 
      composed: true, 
      detail: { checked: this._isDarkMode }
    });
    console.log('Dark mode toggle in header: dispatching event, checked:', this._isDarkMode);
    this.dispatchEvent(darkModeEvent);
  }
  private _handleSignInClick(event: Event) {
    event.preventDefault(); 
    window.location.assign('/login.html'); 
  }

  private _renderSignInButton() {
    return html`
      <a href="/login.html" @click=${this._handleSignInClick} class="auth-link">
        Sign In
      </a>
    `;
  }
  // private _renderSignInButton() {
  //   return html`<a href="/login.html" class="auth-link">Sign In</a>`;
  // }

  private _renderSignOutButton() {
    return html`
      <button
        class="auth-button"
        @click=${(e: Event) => {
          e.preventDefault();
          Events.relay(e, "auth:message", ["auth/signout"]);
          window.location.href = "/app";
        }}
      >
        Sign Out
      </button>
    `;
  }

  override render() {
    return html`
      <header>
        <div class="left-space"></div> 
        <div class="title-with-icon">
          <h1>Cooking Assistant</h1>
          <svg class="icon">
            <use href="/icons/food.svg#icon-bell"></use>
          </svg>
        </div>
        <div class="controls">
          <div class="auth-controls">
            ${this._loggedIn
              ? html`
                  <span class="user-greeting">Hello, ${this._userid || "User"}</span>
                  ${this._renderSignOutButton()}
                `
              : html`
                  <span class="user-greeting">Welcome, Guest</span>
                  ${this._renderSignInButton()}
                `}
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              .checked=${this._isDarkMode}
              @change=${this._handleDarkModeToggle}
              autocomplete="off">
            <span class="slider"></span>
          </label>
        </div>
      </header>
    `;
  }

  static override styles = [
    resetStyles,
    css`
    
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        background: var(--color-background-header);
        color: var(--color-text-inverted);
        font-family: 'Poetsen One', sans-serif;
      }

      .left-space {
        flex: 1;  
      }
      .title-with-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        flex: 2;   
        text-align: center;
      }
      .title-with-icon h1 {
        color: var(--color-text-inverted);
        font-size: 1.8rem;
        font-weight: bold;
        margin: 0;
      }
      .icon {
        height: 1.8em;
        width: 1.8em;
        fill: currentColor;
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 1.5em;
        flex: 1; 
        justify-content: flex-end;
      }
      .auth-controls {
        display: flex;
        align-items: center;
        gap: 1em;
      }
      .user-greeting {
        font-size: 0.9em;
      }
      .auth-link, .auth-button {
        background: none;
        border: 1px solid currentColor;
        color: inherit;
        padding: .3em .8em;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Segoe UI', 'Arial', sans-serif;
      }
      .auth-link:hover, .auth-button:hover {
        opacity: 0.8;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background-color: #ccc; 
        border-radius: 34px;
        transition: background-color 0.3s;
      }
      .slider::before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        top: 4px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.3s;
      }
      .toggle-switch input:checked + .slider {
        background-color: var(--color-link); 
      }
      .toggle-switch input:checked + .slider::before {
        transform: translateX(22px);
      }
    `
  ];
}