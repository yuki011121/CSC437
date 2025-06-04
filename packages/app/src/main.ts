// packages/app/src/main.ts
import { Auth, define, History, Switch } from "@calpoly/mustang";
import { html } from "lit"; // <<< 新增：导入 lit 的 html 模板函数
import { CookHeaderElement } from "./components/cook-header.js"; // CHANGE .ts to .js
import { CookStepElement } from "./components/cook-step.js";   // CHANGE .ts to .js
import { HistoryItemElement } from "./components/history-item.js"; // CHANGE .ts to .js
import { HistoryListElement } from "./components/history-list.js"; // CHANGE .ts to .js
import "./views/home-view.js"; 
import { HomeViewElement } from "./views/home-view.js";
import "./views/history-view.js"; 

// 定义路由规则
const routes = [
  {
    path: "/", // 根路径
    redirect: "/app" // 重定向到 /app
  },
  {
    path: "/app", // 应用的主页 / 登陆后的默认页面
    view: () => html`
      <home-view></home-view>
    `
  },
  {
    path: "/app/history", // 一个示例的历史页面
    view: () => html`<history-view></history-view>`

  },
  {
    path: "/app/recipe/:id", // 一个示例的带参数的食谱详情页面
                             // :id 是一个路径参数
    view: (params: Switch.Params) => html` 
      <h2>Recipe Details</h2>
      <p>Details for recipe ID: ${params.id}</p> 
      <p><a href="/app">Back to Home</a></p>
    `
  },
  // 你可以添加更多路由...
  {
    path: "/app/login", // 虽然 login.html 是独立文件，但如果想在SPA内管理也可以
    view: () => html`<p>Redirecting to login page...</p>`, // 或者直接渲染一个内联登录表单
    // 通常 login.html 是独立处理的，这里只是一个示例
  },
  {
    path: "(.*)", // 捕获所有其他未匹配的路径 (通配符路由，作为404页面)
    view: () => html`<h1>404 - Page Not Found</h1><p><a href="/app">Go Home</a></p>`
  }
];

class AppSwitch extends Switch.Element {
  constructor() {
    // 调用父类构造函数，并传入我们的路由、history 上下文名称和 auth 上下文名称
    // 这些上下文名称必须与 index.html 中 mu-history 和 mu-auth 的 'provides' 属性值完全一致
    super(routes, "cooking:history", "cooking:auth");
  }
}

define({
  "mu-auth": Auth.Provider,       // 定义 <mu-auth>
  "mu-history": History.Provider, // 定义 <mu-history>
  "cook-header": CookHeaderElement,  // 定义 <cook-header>
  "cook-step": CookStepElement,                     // <<< ADD
  "history-item": HistoryItemElement,       // <<< ADD
  "history-list": HistoryListElement,
  "home-view": HomeViewElement,
  "mu-switch": AppSwitch 
  // "mu-switch" 的定义会更复杂一些，我们下一步再做
});

console.log("SPA Main Initialized"); // 一个简单的日志，确认脚本加载

document.body.addEventListener("darkmode:toggle", (e) => {
  const detail = (e as CustomEvent).detail;
  console.log('Global listener in main.ts: darkmode:toggle event received, detail:', detail); // 用于调试
  if (detail && typeof detail.checked === 'boolean') {
    document.body.classList.toggle("dark-mode", detail.checked);
    console.log('Global listener in main.ts: body.classList after toggle:', document.body.classList.toString()); // 用于调试
  } else {
    console.error("Global listener in main.ts: darkmode:toggle event missing detail.checked");
  }
});
// Removed CookHeaderElement.initializeOnce?.(); as it does not exist on CookHeaderElement