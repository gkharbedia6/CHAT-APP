/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: "true",
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        "rich_gray-50": "#a9a9a9",
        "rich_gray-100": "#989898",
        "rich_gray-200": "#878787",
        "rich_gray-300": "#767676",
        "rich_gray-400": "#656565",
        "rich_gray-500": "#555555",
        "rich_gray-600": "#444444",
        "rich_gray-700": "#333333",
        "rich_gray-800": "#222222",
        "rich_gray-900": "#111111",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
