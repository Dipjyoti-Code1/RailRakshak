/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#2D7A4B',  // Calming FarmCycle Green
          700: '#25613D',  // Deep FarmCycle Forest
          800: '#1F4E34',
          900: '#163826',
        },
        harvest: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',  // Warm Golden Amber
          600: '#D97706',
          700: '#B45309',
        },
        rail: {
          bg: '#F9FBF9',        // Soft calming off-white
          card: '#FFFFFF',      // Pure white cards
          primary: '#2D7A4B',   // Calming eye-friendly green
          primaryHover: '#25613D',
          accent: '#0D9488',    // Teal-600
          gold: '#F59E0B',      // Warm golden accent
          surface: '#F8FAFC',
          border: '#E2E8F0',
          text: '#1E293B',
          secondary: '#64748B',
          sos: '#DC2626',
          sosHover: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
