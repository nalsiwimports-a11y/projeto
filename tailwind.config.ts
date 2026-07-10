import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBF6F2",
        surface: "#FFFFFF",
        ink: "#3B2E2A",
        muted: "#8B7873",
        sage: {
          DEFAULT: "#7C9473",
          light: "#DDE6D8",
          dark: "#5A7052",
        },
        rose: {
          DEFAULT: "#E3A6A1",
          light: "#FBE7E4",
          dark: "#C97A75",
        },
        gold: {
          DEFAULT: "#D4A857",
          light: "#F6E9CE",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-karla)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        blob: "42% 58% 61% 39% / 42% 40% 60% 58%",
        soft: "1.75rem",
      },
      boxShadow: {
        soft: "0 12px 40px -12px rgba(59, 46, 42, 0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
