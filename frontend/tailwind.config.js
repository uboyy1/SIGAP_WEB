/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // toggle dengan class 'dark' di html
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          DEFAULT: '#0e2254',
          hover: 'rgba(255,255,255,0.07)',
          active: '#2563eb',
        }
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.08)',
        'card-dark': '0 1px 4px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}