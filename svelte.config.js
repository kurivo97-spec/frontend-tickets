// svelte.config.js
import adapter from '@sveltejs/adapter-static';
// ... (otras importaciones)

const config = {
  // ...
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // <-- ¡ASEGÚRATE DE QUE ESTÉ ESTA LÍNEA!
      precompress: false,
      strict: true
    })
  }
};
export default config;