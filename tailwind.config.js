/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  prefix: 'lst-',
  content: ['./sections/**/*', './snippets/**/*'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fabriga', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#FFFF00',
      },
    },
  },
  plugins: [],
};
