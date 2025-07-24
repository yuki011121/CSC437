import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import resetStyles from "../styles/reset.css.js";

@customElement("signup-form")
export class SignupFormElement extends LitElement {
  @state()
  private _errorMessage?: string;

  static styles = [
    resetStyles,
    css`
      form {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
      }
      input {
        padding: 0.5em;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      button {
        padding: 0.75em 1.5em;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }
      button:hover {
        background-color: #0056b3;
      }
      .error:not(:empty) {
        color: red;
        border: 1px solid red;
        padding: 1em;
        border-radius: 4px;
        margin-top: 1em;
      }
    `
  ];

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <slot></slot>
        <button type="submit">Sign Up</button>
        ${this._errorMessage ? html`<p class="error">${this._errorMessage}</p>` : ""}
      </form>
    `;
  }

  private async _handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    this._errorMessage = undefined;

    const usernameInput = this.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = this.querySelector('input[name="password"]') as HTMLInputElement;

    const username = usernameInput ? usernameInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!username || !password) {
      this._errorMessage = "Username and password are required.";
      return;
    }

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        this._errorMessage = result.message || `Signup failed with status ${response.status}`;
        return;
      }

      if (result.token) {
        // 【最终修复】
        // 我们不再手动跳转，而是发出和 login-form 一样的专业事件
        const customEvent = new CustomEvent('auth:message', {
          bubbles: true,
          composed: true,
          detail: [
            'auth/signin',
            // 确保跳转路径是 /app
            { token: result.token, redirect: "/app" }
          ]
        });
        this.dispatchEvent(customEvent);
      } else {
        this._errorMessage = "Registration succeeded, but no token was provided.";
      }
    } catch (error) {
      console.error("Signup error:", error);
      this._errorMessage = "Failed to connect to the server.";
    }
  }
}