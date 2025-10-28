<script>
  import "../app.css"; 
  // import Navbar from '$lib/components/Navbar.svelte'; // <-- Comentado/Borrado
  // import { page } from '$app/stores'; // <-- Comentado/Borrado
  // $: isLoginPage = $page.route.id === '/'; // <-- Comentado/Borrado
</script>

<div class="min-h-screen bg-fondo text-texto flex flex-col">

  {/* <-- Comentado/Borrado */}
  <main class="flex-grow">
    <slot /> 
  </main>

</div>