/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1a1b1e',
          200: '#2c2e33',
          300: '#3d4148',
          400: '#4a4f57',
          500: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};