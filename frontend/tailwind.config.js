/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F2F3F4',
        primary: '#7e80d8',
        'primary-hover': '#6b6ec7',
        secondary: '#f7d932',
        'secondary-hover': '#f5d41e',
        success: {
          DEFAULT: '#10B981',
          hover: '#059669'
        },
        pastleGreen: {
          DEFAULT: '#bce5bc',
          hover: '#a9cea9',
          text: '#2d7b2d'
        },
        pastleRed: {
          DEFAULT: '#fbd5d5',
          hover: '#e2c0c0',
          text: '#9b1c1c'
        },
        pastleBlue: {
          DEFAULT: '#e1effe',
          hover: '#bcdefa',
          text: '#1e429f'
        },
        text: '#2c2c2c',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'custom-sm': '4px',
        'custom-md': '8px',
        'custom-lg': '12px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      boxShadow: {
        'custom': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 4px 6px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 