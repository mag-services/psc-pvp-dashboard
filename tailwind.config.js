/** @type {import('tailwindcss').Config} */
/**
 * UN palette via CSS variables.
 * Use `rgb(var(--un-*) / <alpha-value>)` so Tailwind does NOT bake in light-mode colours at build time.
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
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        un: 'var(--un-shadow)',
      },
    },
  },
  plugins: [],
};
