import React from "react";
import { createRoot } from "react-dom/client";
import { Join } from "./routes/Join";
import { Practice } from "./routes/Practice";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

const root = createRoot(rootEl);

function renderRoute() {
  const hash = window.location.hash || "#/";
  const view = hash.startsWith("#/practice") ? <Practice /> : <Join />;
  root.render(view);
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
