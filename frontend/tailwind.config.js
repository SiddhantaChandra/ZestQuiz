/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        success: {
          DEFAULT: 'var(--success)',
          hover: 'var(--success-hover)'
        },
        'pastle-green': {
          DEFAULT: 'var(--pastle-green)',
          hover: 'var(--pastle-green-hover)',
          text: 'var(--pastle-green-text)'
        },
        'pastle-red': {
          DEFAULT: 'var(--pastle-red)',
          hover: 'var(--pastle-red-hover)',
          text: 'var(--pastle-red-text)'
        },
        'pastle-blue': {
          DEFAULT: 'var(--pastle-blue)',
          hover: 'var(--pastle-blue-hover)',
          text: 'var(--pastle-blue-text)'
        },
        text: 'var(--text)',
        card: 'var(--card-background)',
        border: 'var(--border-color)',
        shadow: 'var(--shadow-color)',
        'shadow-hover': 'var(--shadow-hover-color)'
      },
      fontFamily: {
        fredoka: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
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
        'custom': '0 2px 4px var(--shadow-color)',
        'custom-hover': '0 4px 6px var(--shadow-hover-color)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
    function({ addBase, theme }) {
      addBase({
        'body': {
          fontFamily: theme('fontFamily.fredoka'),
        },
        'h1, h2, h3, h4, h5, h6': {
          fontFamily: theme('fontFamily.nunito'),
        },
        '.btn, button': {
          fontFamily: theme('fontFamily.nunito'),
        },
        'select, input, textarea': {
          fontFamily: theme('fontFamily.fredoka'),
        },
        'select option': {
          fontFamily: theme('fontFamily.fredoka'),
        },
      });
    },
  ],
} 