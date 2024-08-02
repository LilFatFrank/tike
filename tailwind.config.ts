import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";
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
        "signup-button-text-color": "#EAE9E9",
        "music-upload-color": "#018A08",
        "music-progress-bg": "#3D7F41",
      },
      boxShadow: {
        "cast-upload": "0px -2px 6.89px 0px #0000001A",
        "comment-upload-media-modal":
          "0px 24px 24px -12px #0E3F7E0A, 0px 12px 12px -6px #0E3F7E0A, 0px 6px 6px -3px #2A33460A, 0px 3px 3px -1.5px #2A33460A, 0px 1px 1px -0.5px #2A33450A, 0px 0px 4px 1px #0E3F7E0A",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: PluginAPI["addUtilities"] }) {
      const newUtilities = {
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
      };
      addUtilities(newUtilities);
    },
    require("@tailwindcss/line-clamp"),
  ],
};
export default config;
