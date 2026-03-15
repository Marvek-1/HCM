/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'who-blue': '#009ADE',
        'who-navy': '#1A2B4A',
      }
    },
  },
  plugins: [],
}
