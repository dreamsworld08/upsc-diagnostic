/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a6e',
          50: '#eef2fb',
          100: '#d5e0f5',
          200: '#adc1eb',
          700: '#1e3a6e',
          800: '#162d57',
          900: '#0f1e3c',
        },
        gold: {
          DEFAULT: '#b8962e',
          light: '#f5edd8',
          300: '#e8c76a',
          400: '#d4a843',
          500: '#b8962e',
          600: '#9a7d22',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
