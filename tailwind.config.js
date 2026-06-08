/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'light-bg': '#f8fafc',
        'light-gray': '#cbd5e1',
        'dark-gray': '#475569',
        'neon-pink': '#ff00ff',
        'bright-blue': '#00ffff',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Colores dinámicos para temas
        'theme-bg': 'var(--theme-bg)',
        'theme-text': 'var(--theme-text)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-border': 'var(--theme-border)',
        'theme-card': 'var(--theme-card)',
        
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        bebas: ['Bebas Neue', 'cursive'],
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff',
        'bright-blue': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #00ffff',
      },
    },
  },
  plugins: [],
};
