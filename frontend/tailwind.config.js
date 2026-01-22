/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b0f1a",
        surface: "#101827",
        accent: "#5b8cff"
      }
    }
  },
  plugins: []
};
