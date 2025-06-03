// packages/proto/src/cook-header.ts
import { html, css, LitElement } from "lit";
import { state } from "lit/decorators.js"; // @property 可能不需要，除非从外部传入配置
import { Observer, Auth, Events } from "@calpoly/mustang";
import resetStyles from "./styles/reset.css.js"; // 你的 reset 样式

export class CookHeaderElement extends LitElement {
  private _authObserver = new Observer<Auth.Model>(this, "cooking:auth");

  @state()
  private _loggedIn = false;

  @state()
  private _userid?: string;

  @state()
  private _isDarkMode = false; // 初始状态可以从localStorage读取

  override connectedCallback() {
    super.connectedCallback();
    this._authObserver.observe((authModel: Auth.Model) => {
      const user = authModel.user;
      this._loggedIn = user?.authenticated || false;
      this._userid = user?.username;
    });

    // 初始化暗色模式状态
    // const storedDarkMode = localStorage.getItem('cookingAssistantDarkMode') === 'true';
    // this._isDarkMode = storedDarkMode;
    // document.body.classList.toggle("dark-mode", this._isDarkMode);
    // // 如果希望组件内部的切换器与全局状态同步，需要一种方式来监听全局变化或从外部传入状态
  }

  private _handleDarkModeToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this._isDarkMode = checkbox.checked;
    // localStorage.setItem('cookingAssistantDarkMode', String(this._isDarkMode));

    // 分发全局事件，让 index.html 中的监听器处理 body class 的切换
    const darkModeEvent = new CustomEvent("darkmode:toggle", {
      bubbles: true, // 允许事件冒泡
      composed: true, // 允许事件穿透 Shadow DOM 边界
      detail: { checked: this._isDarkMode }
    });
    this.dispatchEvent(darkModeEvent);
  }

  private _renderSignInButton() {
    return html`<a href="/login.html" class="auth-link">Sign In</a>`;
  }

  private _renderSignOutButton() {
    return html`
      <button
        class="auth-button"
        @click=${(e: Event) => {
          Events.relay(e, "auth:message", ["auth/signout"]);
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
              : this._renderSignInButton()}
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
      /* 你 cook-header.js 中已有的样式，包括 header, .title-with-icon, .icon, .auth-controls 等 */
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
        flex: 1;  /* 左占位 */
      }
      .title-with-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        flex: 2;   /* 中间部分占更宽 */
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
        flex: 1;  /* 右占位 */
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

      /* 暗色模式切换器的 CSS (从你的 page.css 或 tokens.css 借鉴/复制) */
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
        background-color: #ccc; /* 确保这个颜色在暗色模式下也合适或用变量 */
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
        background-color: var(--color-link); /* 使用你的主题链接色 */
      }
      .toggle-switch input:checked + .slider::before {
        transform: translateX(22px);
      }
    `
  ];
}