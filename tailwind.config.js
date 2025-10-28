/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lapis-lazuli': '#386595',
        'night': '#121716',
        'zomp': '#319876',
        'gunmetal': '#252C2B',
        'eerie-back': '#171C1C',
        'viridian': '#287B5F',
        'violet-blue': '#4A429E',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
