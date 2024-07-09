import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      defaultTheme: "light",
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#3E6957",
            },
            secondary: "#191919",
            foreground: "#ffffff",
            warning: {
              DEFAULT: "#f37e4b",
            },
          },
        },
      },
    }),
  ],
};
