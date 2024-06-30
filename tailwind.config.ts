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
        grotesk: ["ClashGrotesk", ...fontFamily.sans],
      },
      backgroundImage: {
        "auth-btn-bg":
          "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(153, 153, 153, 0.2) 100%)",
      },
      colors: {
        white: "rgba(255, 255, 255, 1)",
        black: "rgba(0, 0, 0, 1)",
        "black-20": "rgba(0,0,0,0.2)",
        "black-50": "rgba(0,0,0,0.5)",
        "black-40": "rgba(0,0,0,0.4)",
        "black-70": "rgba(0,0,0,0.7)",
        "black-60": "rgba(0,0,0,0.6)",
        "black-80": "rgba(0,0,0,0.8)",
        "gray-text-1": "#A1A1A1",
        divider: "rgba(0, 0, 0, 0.1)",
        "sign-in-bg": "#09031a",
        "frame-btn-bg": "#EFF1F5",
        "tab-unselected-color": "#A1A1A1",
        purple: "#7C65C1",
        "signup-button-text-color": "#EAE9E9"
      },
    },
  },
  plugins: [],
};
export default config;
