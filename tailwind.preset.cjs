/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-sans)",
      },
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
        ink: "var(--c-product-text)",
        "ink-2": "var(--c-factor-text)",
        muted: "var(--c-muted-text)",
        focus: "var(--c-focus)",
        "status-success": "var(--c-status-success)",
        "status-error": "var(--c-status-error)",
        "grid-border": "var(--c-grid-border)",
        "grid-bg": "var(--c-grid-bg)",
        "grid-fill": "var(--c-grid-fill)",
      },
      fontSize: {
        product: ["var(--fz-product)", { lineHeight: "var(--lh-product)" }],
        factor: ["var(--fz-factor)", { lineHeight: "var(--lh-factor)" }],
        operator: ["var(--fz-operator)", { lineHeight: "var(--lh-operator)" }],
        micro: ["var(--fz-micro)", { lineHeight: "var(--lh-micro)" }],
      },
      borderRadius: {
        swiss: "var(--radius-swiss)",
      },
      transitionTimingFunction: {
        swiss: "var(--ease-swiss)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        standard: "var(--duration-standard)",
      },
      maxWidth: {
        triangle: "var(--sz-triangle)",
      },
      width: {
        "structure-grid": "var(--sz-structure-grid)",
      },
      height: {
        "structure-grid": "var(--sz-structure-grid)",
      },
      minWidth: {
        touch: "var(--sz-touch)",
      },
      minHeight: {
        touch: "var(--sz-touch)",
      },
    },
  },
};
