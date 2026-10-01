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
        sap: {
          blue: '#0a6ed1',
          darkBlue: '#0854a0',
          navy: '#1b2a47',
          gold: '#e29e00',
          lightBg: '#f5f7fa',
          card: '#ffffff',
          darkBg: '#0f172a',
          darkCard: '#1e293b',
          darkBorder: '#334155',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
          success: '#107e3e',
          warning: '#e9730c',
          danger: '#bb0000',
          info: '#0070f2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
