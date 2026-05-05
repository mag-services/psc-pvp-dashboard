/** @type {import('tailwindcss').Config} */
/**
 * UN palette via CSS variables.
 * Shadows & surfaces use `--un-shadow-*` (blue-tinted, institutional — UN / MDB family).
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#185FA5',
        accent: '#378ADD',
        un: {
          fg: 'rgb(var(--un-fg) / <alpha-value>)',
          secondary: 'rgb(var(--un-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--un-tertiary) / <alpha-value>)',
          surface: 'rgb(var(--un-surface) / <alpha-value>)',
          canvas: 'rgb(var(--un-canvas) / <alpha-value>)',
          border: 'rgb(var(--un-border) / <alpha-value>)',
          wash: 'rgb(var(--un-wash) / <alpha-value>)',
          deep: 'rgb(var(--un-deep) / <alpha-value>)',
          navy: 'rgb(var(--un-navy) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        un: 'var(--un-shadow)',
        'un-sm': 'var(--un-shadow-sm)',
        'un-md': 'var(--un-shadow-md)',
        'un-lg': 'var(--un-shadow-lg)',
        'un-inset': 'var(--un-shadow-inset)',
        'un-glow': 'var(--un-shadow-glow)',
      },
    },
  },
  plugins: [],
};
