/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'home-page': "url('/frontend/src/bg1.jpg')",
      }
    },
  },
  plugins: [],
}

