// svelte.config.js

// 1. Importa adapter-static
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // ... (puede que tengas 'preprocess' aquí)
  preprocess: vitePreprocess(),

  kit: {
    // 2. Cambia 'adapter-auto' por 'adapter-static'
    adapter: adapter({
      // Opciones por defecto para un sitio estático (SPA)
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // Importante para que funcionen las rutas
      precompress: false,
      strict: true
    })
  }
};

export default config;