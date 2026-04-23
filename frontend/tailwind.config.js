/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        bgTertiary: 'var(--bg-tertiary)',
        sidebar: 'var(--bg-sidebar)',
        card: 'var(--bg-card)',
        
        textMain: 'var(--text-primary)',
        textSub: 'var(--text-secondary)',
        textTertiary: 'var(--text-tertiary)',
        
        primary: 'var(--accent-cyan)',
        primaryDark: 'var(--accent-cyan-dark)',
        
        cyan: 'var(--accent-cyan)',
        cyanDark: 'var(--accent-cyan-dark)',
        
        teal: 'var(--accent-teal)',

        borderLight: 'var(--border-default)',
        borderHover: 'var(--border-hover)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-md)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 168, 204, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 168, 204, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
