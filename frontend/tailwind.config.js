/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfcf8',
          100: '#faf6ec',
          200: '#f3ead2',
        },
        khaki: {
          100: '#efe6c8',
          200: '#e3d4a3',
          300: '#d3bd79',
          400: '#c2a655',
        },
        forest: {
          50: '#e8f0ea',
          100: '#c7dccb',
          400: '#3f6b47',
          500: '#2f5537',
          600: '#254429',
          700: '#1b331e',
          800: '#132414',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(27, 51, 30, 0.12)',
        card: '0 2px 12px -2px rgba(27, 51, 30, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
