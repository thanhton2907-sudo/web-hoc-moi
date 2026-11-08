/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kid: {
          blue: '#38bdf8',
          yellow: '#facc15',
          green: '#4ade80',
          pink: '#f472b6',
          orange: '#fb923c',
          purple: '#c084fc',
          red: '#f87171',
          bg: '#f0f9ff'
        }
      },
      fontFamily: {
        kid: ['"Lexend"', '"Nunito"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', '"Nunito"', '"Be Vietnam Pro"', 'sans-serif']
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'bounce-soft': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
