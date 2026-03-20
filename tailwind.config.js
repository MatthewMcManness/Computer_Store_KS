/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        /* Custom colors from static-styles.css that don't map to standard Tailwind */
        'bg-light': '#f8f9fb',     /* --background-light */
        'bg-dark': '#f0f2f5',      /* --background-dark */
        silver: '#c0c0c0',         /* --secondary-color (silver accents) */
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'brand-sm': '8px',          /* --border-radius-sm */
        'brand-md': '12px',         /* --border-radius-md */
        'brand-lg': '16px',         /* --border-radius-lg */
        'brand-xl': '24px',         /* --border-radius-xl */
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'brand-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'brand-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'brand-xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'header': '0 4px 20px rgba(37, 99, 235, 0.15), 0 8px 40px rgba(37, 99, 235, 0.1)',
        'header-scrolled': '0 8px 30px rgba(37, 99, 235, 0.2), 0 12px 50px rgba(37, 99, 235, 0.15)',
        'card-hover': '0 20px 40px rgba(37, 99, 235, 0.25)',
        'gallery-card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'gallery-card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'filter-btn': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'filter-btn-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'filter-btn-active': '0 4px 15px rgba(59, 130, 246, 0.4)',
        'blue-glow': '0 4px 15px rgba(59, 130, 246, 0.3)',
        'green-glow': '0 2px 8px rgba(16, 185, 129, 0.3)',
        'purple-glow': '0 2px 8px rgba(139, 92, 246, 0.3)',
        'silver-hover': '0 8px 30px rgba(128, 128, 128, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 30s linear infinite',
        'bf-shimmer': 'bf-shimmer 2s ease-in-out infinite',
        'silver-shine': 'silverShine 3s ease-in-out infinite',
        'gold-border': 'goldBorder 3s ease-in-out infinite',
        'gold-badge-glow': 'goldBadgeGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'bf-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        silverShine: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '50% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        goldBorder: {
          '0%': {
            borderColor: '#ffd700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)',
          },
          '50%': {
            borderColor: '#daa520',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(218, 165, 32, 0.3), inset 0 0 15px rgba(255, 215, 0, 0.15)',
          },
          '100%': {
            borderColor: '#ffd700',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)',
          },
        },
        goldBadgeGlow: {
          '0%': {
            borderColor: '#b8860b',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), 0 0 15px rgba(184, 134, 11, 0.6), 0 0 30px rgba(184, 134, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1)',
          },
          '50%': {
            borderColor: '#996515',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), 0 0 25px rgba(184, 134, 11, 0.8), 0 0 50px rgba(153, 101, 21, 0.6), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1)',
          },
          '100%': {
            borderColor: '#b8860b',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), 0 0 15px rgba(184, 134, 11, 0.6), 0 0 30px rgba(184, 134, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1)',
          },
        },
      },
      transitionDuration: {
        'fast': '150ms',       /* --transition-fast */
        'normal': '300ms',     /* --transition-normal */
        'slow': '500ms',       /* --transition-slow */
      },
    },
  },
  plugins: [],
};
