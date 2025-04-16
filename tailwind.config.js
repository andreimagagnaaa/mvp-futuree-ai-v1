/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#01579b',    // azul escuro
          medium: '#0288d1',  // azul médio
          light: '#b3e5fc',   // azul claro
          white: '#ffffff',   // branco
          black: '#212121'    // preto
        },
        gray: {
          light: '#f5f5f5',  // cinza claro
          medium: '#9e9e9e',  // cinza médio
          dark: '#212121'     // preto
        }
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui, sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #01579b, #0288d1)',
        'gradient-light': 'linear-gradient(to right, #b3e5fc, #ffffff)',
        'pattern': "url('/pattern.svg')",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
      gridTemplateColumns: {
        'services': 'repeat(auto-fit, minmax(280px, 1fr))',
      },
    },
  },
  plugins: [],
}