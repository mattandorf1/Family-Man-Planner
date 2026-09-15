/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: "#2E4034",
        rust: "#8B4A2E",
        gold: "#B08A3E",
        paper: "#FBF8F1",
        paperDk: "#F1EAD8",
        ink: "#262019",
        line: "#C9C0AC",
      },
    },
  },
  plugins: [],
};
