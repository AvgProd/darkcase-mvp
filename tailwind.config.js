/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          dark: "#141414",
          red: "#E50914",
          gray: "#B3B3B3",
        }
      },
    },
  },
  plugins: [],
}
