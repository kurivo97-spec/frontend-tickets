<script>
  import "../app.css";
  import Navbar from '$lib/components/Navbar.svelte'; // Importamos el Navbar
  import { page } from '$app/stores'; // Para saber la ruta actual

  // Verificamos si la ruta actual es la raíz ('/')
  $: isLoginPage = $page.route.id === '/';
</script>

<div class="min-h-screen bg-fondo text-texto flex flex-col">

  {#if !isLoginPage}
    <Navbar />
  {/if}

  <main class="flex-grow">
    <slot />
  </main>

</div>