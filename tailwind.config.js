/** @type {import('tailwindcss').Config} */

module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": '#f3db8f',
          "secondary": '#BCD8C9',
          "accent": '#FDC9CB',
          "neutral": '#DFEEE5',
          "base-100": '#faf6f4'
        },
      },
    ],
  },
  content: ["./app/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
      fontFamily: {
        'sans' : ["'HelveticaNeue'"]
      }
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
}

