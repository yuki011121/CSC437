// packages/app/src/main.ts
import { Auth, define, History, Switch } from "@calpoly/mustang";
import { html } from "lit"; 
import { CookHeaderElement } from "./components/cook-header.js"; 
import { CookStepElement } from "./components/cook-step.js";  
import { HistoryItemElement } from "./components/history-item.js"; 
import { HistoryListElement } from "./components/history-list.js";
import { Msg } from "./messages.js";     
import { Model, init } from "./model.js";
import update from "./update.js";
import { Store } from "@calpoly/mustang";

import "./views/home-view.js"; 
import { HomeViewElement } from "./views/home-view.js";
import "./views/history-view.js"; 

const routes = [
  {
    path: "/", 
    redirect: "/app" 
  },
  {
    path: "/app", 
    view: () => html`
      <home-view></home-view>
    `
  },
  {
    path: "/app/history",
    view: () => html`<history-view></history-view>`

  },
  {
    path: "/app/recipe/:id", 
    view: (params: Switch.Params) => html` 
      <h2>Recipe Details</h2>
      <p>Details for recipe ID: ${params.id}</p> 
      <p><a href="/app">Back to Home</a></p>
    `
  },
  {
    path: "/app/login", 
    view: () => html`<p>Redirecting to login page...</p>`, 
  },
  {
    path: "(.*)",
    view: () => html`<h1>404 - Page Not Found</h1><p><a href="/app">Go Home</a></p>`
  }
];

class AppSwitch extends Switch.Element {
  constructor() {
    super(routes, "cooking:history", "cooking:auth");
  }
}

class AppStore extends Store.Provider<Model, Msg> {
  constructor() {
    super(update, init, "cooking:auth"); 
  }
}

define({
  "mu-auth": Auth.Provider,      
  "mu-history": History.Provider, 
  "mu-switch": AppSwitch,
  "mu-store": AppStore,  
  "cook-header": CookHeaderElement,  
  "cook-step": CookStepElement,                  
  "history-item": HistoryItemElement,       
  "history-list": HistoryListElement,
  "home-view": HomeViewElement
 
});

console.log("SPA Main Initialized"); 

document.body.addEventListener("darkmode:toggle", (e) => {
  const detail = (e as CustomEvent).detail;
  console.log('Global listener in main.ts: darkmode:toggle event received, detail:', detail); 
  if (detail && typeof detail.checked === 'boolean') {
    document.body.classList.toggle("dark-mode", detail.checked);
    console.log('Global listener in main.ts: body.classList after toggle:', document.body.classList.toString()); 
  } else {
    console.error("Global listener in main.ts: darkmode:toggle event missing detail.checked");
  }
});