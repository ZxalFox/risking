// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      heading: ["var(--font-fredoka)", "sans-serif"],
      body: ["var(--font-inter)", "sans-serif"],
    },
    extend: {
      colors: {
        "brand-dark": "#2D3250",
        "brand-medium": "#424769",
        "brand-light": "#676F9D",
        "brand-highlight": "#F9B17A",
      },
    },
  },
  plugins: [],
};
export default config;
