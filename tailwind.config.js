/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  prefix: 'lst-',
  content: ['./sections/**/*', './snippets/**/*', './layout/**/*', './src/**/*'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fabriga', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#FFFF00',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // ...
  ],
};
