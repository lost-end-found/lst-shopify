/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  prefix: 'lst-',
  content: ['./sections/**/*', './snippets/**/*', './layout/**/*', './templates/**/*', './src/**/*'],
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
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: null, // add required value here
          },
        },
        xl: {
          css: {
            p: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              '+ p': {
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
              },
            },
          },
        },
        black: {
          css: {
            '--tw-prose-body': theme('colors.black'),
            '--tw-prose-headings': theme('colors.black'),
            '--tw-prose-lead': theme('colors.black'),
            '--tw-prose-links': theme('colors.black'),
            '--tw-prose-bold': theme('colors.black'),
            '--tw-prose-counters': theme('colors.black'),
            '--tw-prose-bullets': theme('colors.black'),
            '--tw-prose-hr': theme('colors.black'),
            '--tw-prose-quotes': theme('colors.black'),
            '--tw-prose-quote-borders': theme('colors.black'),
            '--tw-prose-captions': theme('colors.black'),
            '--tw-prose-code': theme('colors.black'),
            '--tw-prose-pre-code': theme('colors.black'),
            '--tw-prose-pre-bg': theme('colors.black'),
            '--tw-prose-th-borders': theme('colors.black'),
            '--tw-prose-td-borders': theme('colors.black'),
            '--tw-prose-invert-body': theme('colors.black'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-lead': theme('colors.black'),
            '--tw-prose-invert-links': theme('colors.white'),
            '--tw-prose-invert-bold': theme('colors.white'),
            '--tw-prose-invert-counters': theme('colors.black'),
            '--tw-prose-invert-bullets': theme('colors.black'),
            '--tw-prose-invert-hr': theme('colors.black'),
            '--tw-prose-invert-quotes': theme('colors.black'),
            '--tw-prose-invert-quote-borders': theme('colors.black'),
            '--tw-prose-invert-captions': theme('colors.black'),
            '--tw-prose-invert-code': theme('colors.white'),
            '--tw-prose-invert-pre-code': theme('colors.black'),
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': theme('colors.black'),
            '--tw-prose-invert-td-borders': theme('colors.black'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
