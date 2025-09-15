/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Umamusume brand colors
        'uma-primary': '#FF6B9D',      // Pink
        'uma-secondary': '#C66FBC',    // Purple
        'uma-accent': '#FFC107',       // Gold
        'uma-sky': '#87CEEB',          // Sky blue
        'uma-grass': '#90EE90',        // Track green
        'uma-dark': '#2C1F3D',         // Dark purple
        'uma-light': '#FFF5F7',        // Light pink
      },
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'jp': ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-uma': 'linear-gradient(135deg, #FF6B9D 0%, #C66FBC 50%, #87CEEB 100%)',
      }
    },
  },
  plugins: [],
}