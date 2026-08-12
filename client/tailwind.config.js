/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // Primary Blue — trust, brand chrome, primary CTAs
        primary: {
          50: '#EAF2FB',
          100: '#D3E4F7',
          200: '#A7C9EF',
          300: '#7BAEE7',
          400: '#4F93DF',
          500: '#2678CE',
          600: '#1857A4', // brand primary
          700: '#134685',
          800: '#0F3766',
          900: '#0A2747',
          DEFAULT: '#1857A4',
        },
        // Light Green accent — COD / confirmation / success cues
        accent: {
          50: '#EAFBF3',
          100: '#CFF5E3',
          200: '#9FE9C6',
          300: '#6FDDAA',
          400: '#4FCC93',
          500: '#3FB27F',
          600: '#2F9268',
          700: '#237450',
          DEFAULT: '#3FB27F',
        },
        ink: '#132436',
        sand: '#F6F8FB',
        sale: '#E4572E',
      },
      fontFamily: {
        display: ['"Tajawal"', 'system-ui', 'sans-serif'],
        body: ['"Tajawal"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px 0 rgba(19, 36, 54, 0.06)',
        cardHover: '0 8px 24px 0 rgba(19, 36, 54, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideInEnd: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
      },
      animation: {
        slideUp: 'slideUp .35s ease-out',
        slideInEnd: 'slideInEnd .25s ease-out',
      },
    },
  },
  plugins: [],
};
