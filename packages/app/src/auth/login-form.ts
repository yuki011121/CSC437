// packages/app/src/auth/login-form.ts
import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import resetStyles from "../styles/reset.css.js";

interface LoginFormData {
  username?: string;
  password?: string;
}

export class LoginFormElement extends LitElement {

  @state()
  formData: LoginFormData = {};

  @property()
  api?: string;

  @property()
  redirect: string = "/";

  @state()
  error?: string;

  get canSubmit(): boolean {
    return Boolean(this.api && this.formData.username && this.formData.password);
  }

  override render() {
    return html`
      <form
        @change=${(e: InputEvent) => this.handleChange(e)}
        @submit=${(e: SubmitEvent) => this.handleSubmit(e)}
      >
        <slot></slot>
        <slot name="button">
          <button
            ?disabled=${!this.canSubmit}
            type="submit">
            Login
          </button>
        </slot>
        ${this.error ? html`<p class="error">${this.error}</p>` : ""}
      </form>
    `;
  }

  static override styles = [
    resetStyles,
    css`
      form {
        display: flex;
        flex-direction: column;
        gap: var(--size-spacing-medium, 1em);
      }
      label {
        display: flex;
        flex-direction: column;
        gap: var(--size-spacing-small, 0.5em);
      }
      input {
        padding: var(--size-input-padding, 0.5em);
        border: 1px solid var(--color-input-border, #ccc);
        border-radius: var(--radius-input, 4px);
      }
      button {
        padding: var(--size-button-padding, 0.75em 1.5em);
        background-color: var(--color-button-primary-bg, #007bff);
        color: var(--color-button-primary-text, white);
        border: none;
        border-radius: var(--radius-button, 4px);
        cursor: pointer;
      }
      button:disabled {
        background-color: var(--color-button-disabled-bg, #ccc);
        cursor: not-allowed;
      }
      .error:not(:empty) {
        color: var(--color-error-text, red);
        border: 1px solid var(--color-error-border, red);
        padding: var(--size-spacing-medium, 1em);
        border-radius: var(--radius-input, 4px);
        margin-top: var(--size-spacing-medium, 1em);
      }
    `
  ];

  handleChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    const name = target?.name;
    const value = target?.value;
    const prevData = this.formData;

    switch (name) {
      case "username":
        this.formData = { ...prevData, username: value };
        break;
      case "password":
        this.formData = { ...prevData, password: value };
        break;
    }
  }

  handleSubmit(submitEvent: SubmitEvent) {
    submitEvent.preventDefault();
    this.error = undefined; 

    if (this.canSubmit && this.api) { 
      fetch(
        this.api,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.formData)
        }
      )
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Login failed: Invalid username or password.");
        }
        if (!res.ok) { 
          throw new Error(`Login failed: Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((json: object) => {
          const { token } = json as { token: string };
          if (!token) {
            throw new Error("Login failed: Token not received from server.");
          }
          const customEvent = new CustomEvent(
            'auth:message', {
              bubbles: true,
              composed: true,
              detail: [
                'auth/signin',
                { token, redirect: this.redirect }
              ]
            }
          );
          this.dispatchEvent(customEvent);
      })
      .catch((error: Error) => {
          this.error = error.message || "An unknown error occurred during login.";
      });
    } else if (!this.api) {
        this.error = "API endpoint is not configured for the login form.";
    }
  }
}