/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        arcade: {
          cyan: '#2DD4BF',
          yellow: '#FCD34D',
          purple: '#4C1D95',
          dark: '#1A103C',
          light: '#E5E7EB'
        }
      },
      boxShadow: {
        'arcade': '0 4px 20px -2px rgba(45, 212, 191, 0.5)',
        'arcade-hover': '0 8px 30px -2px rgba(45, 212, 191, 0.7)'
      },
      backgroundImage: {
        'gradient-arcade': 'linear-gradient(135deg, rgba(76, 29, 149, 0.95), rgba(26, 16, 60, 0.95))'
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 10px rgba(45, 212, 191, 0.5)' },
          '100%': { 'box-shadow': '0 0 20px rgba(45, 212, 191, 0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
};