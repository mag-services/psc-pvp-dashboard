/** @type {import('tailwindcss').Config} */
/** UN “Executive” corporate palette (aligned with Power BI Executive UN theme) */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#185FA5',
        accent: '#378ADD',
        un: {
          fg: '#1A1A1A',
          secondary: '#4A5568',
          tertiary: '#718096',
          surface: '#FFFFFF',
          canvas: '#F7F9FC',
          border: '#E2E8F0',
          wash: '#E8F1FB',
          deep: '#0D4A7A',
          navy: '#1A365D',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        un: '0 1px 2px rgba(26, 26, 26, 0.04)',
      },
    },
  },
  plugins: [],
};
