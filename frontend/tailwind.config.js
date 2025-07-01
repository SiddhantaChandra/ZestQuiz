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
        primary: {
          DEFAULT: '#7e80d8',
          hover: '#6b6ec7'
        },
        secondary: {
          DEFAULT: '#f7d932',
          hover: '#f5d41e'
        },
        pastleGreen:{
          DEFAULT: '#73d673',
          hover: "#57a357"
        },
        pastleRed:{
          DEFAULT: '#f7665f',
          hover: "#c3504b"
        },
        pastleBlue:{
          DEFAULT: '#9dbaf6',
          hover: "#7c93c3"
        },
        text: '#2c2c2c',
      },
      fontFamily: {
        fredoka: ['var(--font-fredoka)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
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
  plugins: [],
} 