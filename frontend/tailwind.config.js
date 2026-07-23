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
        vercel: {
          100: '#FAFAFA',
          200: '#EAEAEA',
          300: '#999999',
          400: '#888888',
          500: '#666666',
          600: '#444444',
          700: '#333333',
          800: '#111111',
          900: '#000000',
        },
        financial: {
          profit: '#054F31',     // Dark muted forest green text
          profitBg: '#D1F4E0',   // Light muted green background
          profitDark: '#4ADE80', // Lighter green for dark mode text
          profitBgDark: '#064E3B',// Very dark green for dark mode bg
          loss: '#7F1D1D',       // Dark muted brick red text
          lossBg: '#FEE2E2',     // Light muted red bg
          lossDark: '#F87171',   // Lighter red for dark mode text
          lossBgDark: '#7F1D1D', // Very dark red for dark mode bg
        }
      },
      fontFamily: {
        // We will default to a stack that mimics Geist/Inter and system UI
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Stripe/Vercel inspired ultra-soft, diffused multi-layered shadows
        'vercel-soft': '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'vercel-modal': '0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.05)',
        'vercel-dark': '0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)',
      },
      letterSpacing: {
        'vercel-tight': '-0.02em',
        'vercel-tighter': '-0.04em',
      }
    },
  },
  plugins: [],
}
