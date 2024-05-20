/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'lst-',
  content: ['./sections/**/*', './snippets/**/*'],
  theme: {
    extend: {
      colors: {
        primary: '#FFFF00',
      },
    },
  },
  plugins: [],
};
