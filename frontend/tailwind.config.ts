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
        "risk-primary": "#cd5400",
        "risk-light": "#ffb3a1",
        "risk-dark": "#602300",
        "mitigation-primary": "#3d8066",
        "mitigation-light": "#9ef9d4",
        "mitigation-dark": "#295a47",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
};
export default config;
