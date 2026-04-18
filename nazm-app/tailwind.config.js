/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["'Rubik'", "'Readex Pro'", 'system-ui', 'sans-serif'],
        sans: ["'Rubik'", "'Inter'", 'system-ui', 'sans-serif'],
      },
      colors: {
        'nazm-purple': '#8B5CF6',
        'nazm-cyan': '#A5F3FC',
      },
    },
  },
  plugins: [],
};
