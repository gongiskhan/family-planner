/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.8)',
          medium: 'rgba(255, 255, 255, 0.6)',
          heavy: 'rgba(255, 255, 255, 0.4)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.2)',
          'glass-dark': 'rgba(255, 255, 255, 0.1)',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-elevated': '0 16px 64px rgba(0, 0, 0, 0.15)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'glass': '16px',
        'glass-lg': '20px',
        'glass-xl': '24px',
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite alternate',
        'bounce-subtle': 'bounce-subtle 0.6s ease',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'glass-shimmer': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    },
  },
  plugins: [],
}