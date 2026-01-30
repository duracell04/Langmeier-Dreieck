import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Landing } from "./marketing/Landing";
import { StyleGuide } from "./StyleGuide";
import "./styles/app.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

const root = createRoot(rootEl);

function renderRoute() {
  const hash = window.location.hash || "#/";
  const view = hash.startsWith("#/app")
    ? <App />
    : hash.startsWith("#/style-guide")
      ? <StyleGuide />
      : hash.startsWith("#/landing") || hash === "#/"
        ? <Landing />
        : <Landing />;
  root.render(view);
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
