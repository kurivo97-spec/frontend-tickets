// svelte.config.js (CON adapter-node)
import adapter from '@sveltejs/adapter-node'; // <-- Cambio
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter() // <-- Cambio
  }
};
export default config;