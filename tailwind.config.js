/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft sage green as primary
        primary: {
          50: '#f2f7f4',
          100: '#e6efe9',
          200: '#c2dacb',
          300: '#9dc5ae',
          400: '#79b092',
          500: '#559a75',
          600: '#447c5e',
          700: '#365e47',
          800: '#294a37',
          900: '#1b3225',
        },
        // Lavender mist as secondary
        secondary: {
          50: '#f5f3fa',
          100: '#ebe7f5',
          200: '#d7d0eb',
          300: '#beb4dd',
          400: '#a497cf',
          500: '#8b7ac1',
          600: '#7060ab',
          700: '#5a4d86',
          800: '#443a65',
          900: '#2f2745',
        },
        // Warm peach as accent
        accent: {
          50: '#fff4ed',
          100: '#ffe8d9',
          200: '#ffd1b3',
          300: '#ffb78c',
          400: '#ff9a66',
          500: '#ff7c3f',
          600: '#e55f2b',
          700: '#b94621',
          800: '#8c341b',
          900: '#652815',
        },
        // Golden cream for highlights
        cream: {
          50: '#fffaea',
          100: '#fff5d6',
          200: '#ffecad',
          300: '#ffe285',
          400: '#ffd85c',
          500: '#ffce33',
          600: '#e5b01a',
          700: '#b28614',
          800: '#886611',
          900: '#5f480e',
        },
        // Charcoal for text
        charcoal: {
          50: '#f6f7f7',
          100: '#e1e3e3',
          200: '#c2c6c7',
          300: '#a2a9aa',
          400: '#848c8e',
          500: '#697073',
          600: '#515659',
          700: '#3d4143',
          800: '#2b2e2f',
          900: '#1a1c1d',
        },
      },
      fontFamily: {
        display: ['Quicksand', 'Comic Sans MS', 'Comic Sans', 'cursive'],
        body: ['Nunito', 'Arial Rounded MT Bold', 'Helvetica Rounded', 'Arial', 'sans-serif'],
        handwriting: ['Caveat', 'Bradley Hand', 'cursive'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      borderRadius: {
        'bubble': '40% 60% 60% 40% / 60% 30% 70% 40%',
        'soft': '2rem',
      },
    },
  },
  plugins: [],
};