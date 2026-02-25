import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5A623',
          'yellow-dark': '#D4911A',
          black: '#1A1A1A',
          steel: '#8A8A8A',
          'steel-light': '#C0C0C0',
          'steel-dark': '#4A4A4A',
          wood: '#8B6914',
          forest: '#2D5A27',
          charcoal: '#2C2C2C',
          smoke: '#F0F0F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Impact', 'Arial Black', 'sans-serif'],
      },
      backgroundImage: {
        'metal-texture': "url('/textures/metal.png')",
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
