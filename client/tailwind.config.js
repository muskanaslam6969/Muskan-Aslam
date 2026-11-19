/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: { extend: { colors: { navy: { 950: '#0b1d3a', 900: '#102a56', 800: '#173b70' }, sky: { 50: '#f0f8ff', 100: '#dff1ff', 500: '#2998e8' } }, boxShadow: { soft: '0 12px 35px rgba(16,42,86,.08)' } } },
  plugins: []
};