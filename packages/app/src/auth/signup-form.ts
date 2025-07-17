import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("signup-form")
export class SignupFormElement extends LitElement {
  @state()
  private _errorMessage = "";

  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 4rem auto;
      padding: 2rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-background-secondary);
    }
    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: var(--color-text-primary);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    label {
      font-weight: bold;
      color: var(--color-text-secondary);
    }
    input {
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }
    button {
      padding: 0.75rem;
      border: none;
      border-radius: var(--radius-sm);
      background-color: var(--color-primary);
      color: white;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: var(--color-primary-hover);
    }
    .error-message {
      color: var(--color-error);
      text-align: center;
      margin-top: 1rem;
      min-height: 1.2em;
    }
    .login-link {
      text-align: center;
      margin-top: 1rem;
    }
    .login-link a {
      color: var(--color-primary);
      text-decoration: none;
    }
    .login-link a:hover {
      text-decoration: underline;
    }
  `;

  render() {
    return html`
      <h1>Create Account</h1>
      <form @submit=${this._handleSubmit}>
        <div>
          <label for="username">Username</label>
          <input id="username" name="username" type="text" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <div class="error-message">${this._errorMessage}</div>
      <div class="login-link">
        <span>Already have an account? </span>
        <a href="/login.html">Log In</a>
      </div>
    `;
  }

  private async _handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    this._errorMessage = "";

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        this._errorMessage = result.message || "An unknown error occurred.";
        return;
      }

      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        window.location.href = "/"; 
      } else {
        this._errorMessage = "Registration succeeded, but no token was provided.";
      }
    } catch (error) {
      console.error("Signup error:", error);
      this._errorMessage = "Failed to connect to the server. Please try again.";
    }
  }
}
