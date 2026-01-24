import React from "react";

export function Practice() {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <h1>Practice</h1>
      <p>Quick practice mode (no join, no accounts).</p>
      <button
        type="button"
        onClick={() => {
          window.location.hash = "#/";
        }}
      >
        Back
      </button>
    </main>
  );
}
