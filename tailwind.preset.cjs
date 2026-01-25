/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: "var(--c-bg)",
        surface: "var(--c-surface)",
        border: "var(--c-border)",
        text: {
          primary: "var(--c-text-primary)",
          secondary: "var(--c-text-secondary)",
        },
        primary: "var(--c-primary)",
        success: "var(--c-success)",
        warning: "var(--c-warning)",
        info: "var(--c-info)",
        danger: "var(--c-danger)",
      },
      fontSize: {
        product: ["4rem", { lineHeight: "1" }],
        factor: ["2.5rem", { lineHeight: "1" }],
      },
    },
  },
};
