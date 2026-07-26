import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#0b4a3a", light: "#0f6b52" },
        gold: { DEFAULT: "#c9a227", light: "#f4c542" },
        ivory: "#fbf8f1",
        charcoal: "#121613",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
