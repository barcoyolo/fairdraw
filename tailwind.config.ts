import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          ink: "#17211c",
          pine: "#0f4f3d",
          mint: "#dff4ec",
          gold: "#b8872d",
          paper: "#f7f4ec",
          line: "#d8d0c1"
        }
      },
      boxShadow: {
        civic: "0 18px 50px rgba(23, 33, 28, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
