import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        jakarta: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderWidth: { DEFAULT: '2px' },
      borderRadius: {
        none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0',
      },
      boxShadow: {
        sm: '3px 3px 0 0 #0a0a0a',
        DEFAULT: '4px 4px 0 0 #0a0a0a',
        md: '4px 4px 0 0 #0a0a0a',
        lg: '6px 6px 0 0 #0a0a0a',
        xl: '8px 8px 0 0 #0a0a0a',
        '2xl': '10px 10px 0 0 #0a0a0a',
        brutal: '6px 6px 0 0 #0a0a0a',
        'brutal-sm': '3px 3px 0 0 #0a0a0a',
        'brutal-lg': '10px 10px 0 0 #0a0a0a',
      },
      colors: {
        ink: '#0a0a0a',
        paper: '#F4F1EA',
        signal: '#FFD60A',
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
export default config;
