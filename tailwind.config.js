/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          850: '#111827',
          900: '#0B1120',
          950: '#060B14'
        },
        railway: {
          blue: '#1E3A8A',
          amber: '#F59E0B',
          red: '#DC2626',
          green: '#10B981',
          teal: '#0D9488'
        }
      }
    },
  },
  plugins: [],
}
