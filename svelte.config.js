// svelte.config.js (SIMPLIFICADO AL MÍNIMO)

import adapter from '@sveltejs/adapter-static'; // Mantenemos el import
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // Usamos adapter-static SIN opciones extra, solo el fallback
    adapter: adapter({
      fallback: 'index.html' 
    })
  }
};

export default config;