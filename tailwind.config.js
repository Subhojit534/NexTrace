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
        gemini: {
          bg: '#131314',
          surface: '#1e1f20',
          surfaceHover: '#282a2c',
          card: '#18191a',
          border: '#333538',
          text: '#e3e3e3',
          muted: '#9aa0a6',
          blue: '#1a73e8',
          blueHover: '#1b66c9',
          accent: '#8ab4f8',
          gradientStart: '#7c3aed',
          gradientEnd: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
