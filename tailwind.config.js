/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F15B15', // Твій фірмовий помаранчевий колір для портфоліо!
      },
    },
  },
  plugins: [],
}