// tailwind.config.cjs
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter first, then Tailwind’s default sans stack
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },

    },
  },
  plugins: [],
};
