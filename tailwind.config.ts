import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satisfy: ["Satisfy", ...fontFamily.sans],
      },
      backgroundImage: {
        "auth-btn-bg":
          "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(153, 153, 153, 0.2) 100%)",
      },
      colors: {
        white: "rgba(255, 255, 255, 1)",
        black: "rgba(0, 0, 0, 1)",
        "black-50": "rgba(0,0,0,0.5)",
        "gray-text-1": "#A1A1A1",
        "divider": "rgba(0, 0, 0, 0.1)",
        "sign-in-bg": "#09031a",
        "frame-btn-bg": "#EFF1F5"
      },
    },
  },
  plugins: [],
};
export default config;
