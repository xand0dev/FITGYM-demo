/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff0000',
        background: '#080808',
        surface: '#121212',
        surfaceLight: '#1a1a1a',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card':  '16px',
        'btn':   '8px',
        'badge': '100px',
      }
    },
  },
  plugins: [],
}