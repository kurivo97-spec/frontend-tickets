<script>
  import "../app.css"; 
  import Navbar from '$lib/components/Navbar.svelte'; // <-- 1. Importamos el Navbar
  import { page } from '$app/stores'; // <-- 2. Importamos 'page' para saber la ruta actual

  // 3. Verificamos si la ruta actual es la raíz ('/')
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