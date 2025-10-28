// tailwind.config.js (Corregido)

import formsPlugin from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'], 
  theme: {
    extend: {
      colors: {
        'principal': '#5CB88A', 
        'oscuro': '#0A4A2B',
        'acento': '#F2B90C',
        'fondo': '#F5F7FA',
        'texto': '#333333'
      }
    }
  },
  plugins: [formsPlugin] 
};