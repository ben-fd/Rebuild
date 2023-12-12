/** @type {import('tailwindcss').Config} */

module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#f3db8f',
          secondary: '#BCD8C9',
          accent: '#FDC9CB',
          neutral: '#DFEEE5',
          'base-100': '#faf6f4',
          '--rounded-btn': '2rem',
          lowfodmap: '#089fdf',
          leanlighter: '#d1757f',
          mediterranean: '#e1eab2',
        },
      },
    ],
  },
  content: ['./app/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ["'HelveticaNeue'"],
    },
    extend: {
      backgroundImage: {
        'hero-texture':
          "url('https://cdn.shopify.com/s/files/1/0271/2662/8450/files/hp-bg-n.webp?v=1679557996');",
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
};
