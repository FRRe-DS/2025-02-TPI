/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",       // Todo dentro de src
    "./src/app/**/*.{js,ts,jsx,tsx}",   // <-- FALTABA ESTO
    "./app/**/*.{js,ts,jsx,tsx}",       // <-- Por si Next usa /app directo
    "../../**/*.{js,ts,jsx,tsx}",       
    "./node_modules/flowbite/**/*.js"
  ],

  theme: {
    extend: {},
  },

  plugins: [
    // require("flowbite/plugin"),
  ],
}
