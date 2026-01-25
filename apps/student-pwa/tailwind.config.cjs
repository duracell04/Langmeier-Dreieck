const sharedPreset = require("../../tailwind.preset.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
};
