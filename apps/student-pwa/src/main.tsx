import React from "react";
import { createRoot } from "react-dom/client";
import { Join } from "./routes/Join";
import { Landing } from "./routes/Landing";
import { Practice } from "./routes/Practice";
import { Results } from "./routes/Results";
import { Select } from "./routes/Select";
import { StyleGuide } from "./routes/StyleGuide";
import { I18nProvider } from "./i18n";
import "./styles/app.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

const root = createRoot(rootEl);

function renderRoute() {
  const hash = window.location.hash || "#/";
  const view = hash.startsWith("#/landing") || hash === "#/"
    ? <Landing />
    : hash.startsWith("#/style-guide")
      ? <StyleGuide />
    : hash.startsWith("#/results")
      ? <Results />
    : hash.startsWith("#/select")
      ? <Select />
    : hash.startsWith("#/practice")
      ? <Practice />
      : hash.startsWith("#/join") || hash.startsWith("#/demo")
        ? <Join />
        : <Landing />;
  root.render(
    <I18nProvider>
      {view}
    </I18nProvider>
  );
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
