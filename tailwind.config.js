/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f5fce8',
          100: '#ebf9d1',
          200: '#d7f3a3',
          300: '#c3ed75',
          400: '#afe747',
          500: '#aff539', // Primary brand color
          600: '#8fc42d',
          700: '#6f9321',
          800: '#4f6215',
          900: '#2f3109',
          950: '#1f2006',
        },
      },
    },
  },
  plugins: [],
};
