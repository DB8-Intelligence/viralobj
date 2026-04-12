import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        viral: {
          bg: "#0a0a0f",
          card: "#14141f",
          border: "#2a2a3a",
          accent: "#ff3366",
          accent2: "#00e5ff",
          text: "#f5f5f7",
          muted: "#8888a0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
