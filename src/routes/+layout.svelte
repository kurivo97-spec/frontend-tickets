<script>
  import "../app.css"; 
  import Navbar from '$lib/components/Navbar.svelte'; 
  import { page } from '$app/stores'; 
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