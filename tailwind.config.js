/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          green: '#15803d', // emerald green (dark)
          leaf: '#22c55e', // leafy emerald
          mint: '#f0fdf4', // light emerald
          blue: '#0284c7', // agro blue
          sky: '#f0f9ff', // light sky blue
          red: '#dc2626', // critical alert
          blush: '#fef2f2', // light critical
          soil: '#7c2d12', // brown/soil
          amber: '#d97706', // gold/warning
          gold: '#fef9c3', // light gold/warning
          indigo: '#4f46e5' // deep operational indigo
        }
      },
      boxShadow: {
        field: '0 10px 30px rgba(2, 132, 199, 0.08)',
        premium: '0 20px 40px rgba(15, 23, 42, 0.06)'
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'scan-line': 'scanLine 2.5s infinite linear'
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' }
        },
        scanLine: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' }
        }
      }
    }
  },
  plugins: []
};
