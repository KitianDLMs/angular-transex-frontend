/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      'montserrat': [ 'Montserrat', 'sans-serif' ]
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        'fade-in-left': 'fadeInLeft 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in-left': {
          '0%': { opacity: 0, transform: 'translateX(-50px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [
    require( 'daisyui' ),
  ],
  daisyui: {
    themes: [ 'garden' ]
  }
}

