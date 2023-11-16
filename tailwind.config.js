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
          "base-100": '#faf6f4',
          "info": '#ffffff',
          "success": '#ffffff',
          "warning": '#ffffff',
          "error": '#ffffff',
        },
      },
    ],
  },
  content: ["./app/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans' : ["Helvetica Neue"]
      }
    },
  },
  plugins: [require("daisyui")],
}

