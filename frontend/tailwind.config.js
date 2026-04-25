/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Godavari river theme
        primary: {
          DEFAULT: '#1a4a6b',
          light: '#2d6e9e',
          dark: '#0f2d42',
        },
        river: {
          DEFAULT: '#4a90a4',
          light: '#7ab5c7',
          mist: '#b8d4e8',
        },
        stone: {
          bridge: '#6b5e4a',
          warm: '#8b7355',
          light: '#c9b89a',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e8cc6a',
          dark: '#a88a20',
        },
        sky: {
          godavari: '#d4e8f0',
          dawn: '#e8f4f8',
        },
        boat: {
          green: '#2d6a4f',
          teal: '#3d8b6e',
        },
        earth: '#c9a96e',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'godavari-gradient': 'linear-gradient(135deg, #0f2d42 0%, #1a4a6b 40%, #4a90a4 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(15,45,66,0.7) 0%, rgba(26,74,107,0.5) 50%, rgba(74,144,164,0.3) 100%)',
        'stone-gradient': 'linear-gradient(135deg, #6b5e4a 0%, #8b7355 100%)',
      },
      boxShadow: {
        'river': '0 4px 20px rgba(74, 144, 164, 0.3)',
        'card': '0 8px 32px rgba(15, 45, 66, 0.12)',
        'gold': '0 4px 15px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'ripple': 'ripple 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        ripple: {
          '0%, 100%': { transform: 'scaleX(1)', opacity: '0.5' },
          '50%': { transform: 'scaleX(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
