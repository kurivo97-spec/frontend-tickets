<script>
  // Importa el CSS global
  import "../app.css";
  // Importa el componente Navbar
  import Navbar from '$lib/components/Navbar.svelte';
  // Importa 'page' para saber en qué ruta estamos
  import { page } from '$app/stores';

  // Variable reactiva: es true si estamos en la página raíz (login)
  $: isLoginPage = $page.route.id === '/';
</script>

<div class="min-h-screen bg-fondo text-texto flex flex-col">

  {#if !isLoginPage}
    <Navbar />
  {/if}

  <main class="flex-grow">
    <slot /> </main>

  </div>