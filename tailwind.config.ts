import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      light: "#FFFFFF",
      black: "#0D0D0D",
      ash: "#575757",
      search: "#959595",
      "light-grey": "#F5F5F5",
      red: "#F20A0A",
      "form-red": "#F20A0A",
      "placeholder-ash": "#959595",
      dashboard: "#1F1E25",
      dashboard_table: "#1A1A1A",
      dashboard_table_sec: "#1F1E25",
    },
    extend: {
      backgroundImage: {
        "login-banner": "url(/images/banners/login.webp)",
        "sign-up-banner": "url(/images/banners/sign-up.webp)",
        "home-one": "url(/images/banners/home-hero.webp)",
        "summer-sales": "url(/images/banners/summer-sales.webp)",
        "get-discount": "url(/images/banners/discount.webp)",
      },
    },
    fontFamily: {
      sans: ["var(--font-neue)"],
    },
  },
  plugins: [],
};
export default config;
