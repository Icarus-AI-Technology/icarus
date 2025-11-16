/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OraclusX Design System Colors
        'bg-primary': '#0f1419',
        'bg-secondary': '#1a1f26',
        'bg-tertiary': '#232930',
      },
      boxShadow: {
        // Neumorphic shadows
        'neumorph-elevated': '5px 5px 15px rgba(0,0,0,0.5), -5px -5px 15px rgba(255,255,255,0.03)',
        'neumorph-inset': 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
}
