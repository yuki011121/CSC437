// src/history-list.ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
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

  private _authObserver = new Observer<Auth.Model>(this, "cooking:auth"); // <<< 和 cook-header 一致
  private _user?: Auth.User; // <<< 存储用户信息，包括 toke

  private get _authorization() {
    if (this._user?.authenticated && this._user.token) { // 确保用户已认证且有 token
      return { Authorization: `Bearer ${this._user.token}` };
    }
    return {}; // 未认证则不发送 Authorization header
  }
  
  override connectedCallback() {
    super.connectedCallback();
    // 观察认证状态
    this._authObserver.observe((authModel: Auth.Model) => {
      this._user = authModel.user;
      // 当用户信息（特别是 token）变化时，重新获取数据
      // 或者在用户存在时才获取数据
      if (this._user?.authenticated) {
        this._loadHistory(); // 调用加载数据的方法
      } else {
        // 用户未登录，清空列表并提示
        this._historyItems = [];
        this._error = "Please sign in to view history.";
        this._isLoading = false;
      }
    });

  }
  private async _loadHistory() {
    this._isLoading = true;
    this._error = undefined; // 清除旧错误

    // 注意：这里的 URL 指向你的后端服务器的 API 端点
    // 前端在 5173，后端在 3000，所以需要完整 URL
    const apiUrl = "http://localhost:3000/api/history"; 

    try {
      const response = await fetch(apiUrl, { 
        headers: this._authorization // <<< 新增：添加认证头
      });

      if (response.status === 401 || response.status === 403) {
        this._error = "Unauthorized: Please sign in to view history.";
        this._historyItems = [];
        this._isLoading = false;
        return; // 提前退出
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
  // async hydrate(url: string) {
  //   try {
  //     const response = await fetch(url); 
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`); 
  //     }
  //     const data = await response.json(); 

  //     if (Array.isArray(data)) {
  //       this._historyItems = data as HistoryItemData[]; 
  //     } else {
  //       console.error('HistoryListElement: Fetched data is not an array.', data);
  //       this._historyItems = []; 
  //     }
  //   } catch (error) {
  //     console.error('HistoryListElement: Failed to fetch or parse data.', error);
  //     this._historyItems = []; 
  //   }
  // }

  // override render() {
  //   if (!this._historyItems.length) {
  //     return html`<p>Loading history...</p>`; 
  //   }

  //   return html`
  //     <ul>
  //       ${this._historyItems.map(item => 
  //         html`
  //           <cook-history-item href="${item.link}">${item.text}</cook-history-item>
  //         `
  //       )}
  //     </ul>
  //   `;
  // }
  override render() {
    if (this._isLoading) {
      return html`<p>Loading history...</p>`;
    }
    if (this._error) {
      return html`<p class="error-message">${this._error}</p>`;
    }
    if (!this._historyItems.length && !this._error) { // 没有错误但列表为空
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
      color: var(--color-error-text, red); /* 使用你的 tokens.css 变量 */
      padding: 0.5em 0;
    }
  `;
}