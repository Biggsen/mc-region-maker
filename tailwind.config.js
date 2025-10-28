/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lapis-lazuli': '#386595', // primary
        'viridian': '#287B5F', // secondary
        'violet-blue': '#4A429E',
        'silver-lake-blue': '#5C8DC1',
        'vista-blue': '#7AA2CD',
        'night': '#121716',
        'zomp': '#319876',
        'gunmetal': '#252C2B',
        'eerie-back': '#171C1C',
        'hover-surface': '#2D3433', // ghost button hover
        'active-surface': '#1E2322', // ghost button active
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
