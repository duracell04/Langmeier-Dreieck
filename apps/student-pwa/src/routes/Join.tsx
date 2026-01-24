import React from "react";

export function Join() {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <h1>Triangle 1x1</h1>
      <p>No login needed for quick practice.</p>
      <button
        type="button"
        onClick={() => {
          window.location.hash = "#/practice";
        }}
      >
        Quick practice
      </button>
    </main>
  );
}
