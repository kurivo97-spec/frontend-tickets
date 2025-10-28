<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Variables para mostrar los datos del usuario
  let nombreUsuario = ''; // Empezamos vacío
  let idRol = null; // Empezamos en null para saber si ya cargó

  /**
   * Cierra la sesión del usuario
   */
  function handleLogout() {
    if (browser) {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.removeItem('usuario');
      goto('/');
    }
  }

  // onMount se ejecuta SOLO en el navegador (browser)
  onMount(() => {
    if (browser) {
      const usuarioData = localStorage.getItem('usuario');

      if (usuarioData) {
        try {
          const usuario = JSON.parse(usuarioData);
          // Guardamos el nombre y rol
          nombreUsuario = usuario.nombre || 'Usuario';
          idRol = usuario.id_rol || 1;
        } catch (e) {
          console.error("Error al parsear datos de usuario:", e);
          handleLogout(); // Sesión corrupta, cerramos
        }
      } else {
        console.warn("No se encontraron datos de 'usuario'. Cerrando sesión.");
        handleLogout(); // No hay sesión, cerramos
      }
    }
  });

</script>

<nav class="bg-principal text-white shadow-md sticky top-0 z-50">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <div class="flex-shrink-0">
        <a href="/dashboard" class="text-xl font-bold hover:opacity-80 transition-opacity">Tickets CENDIDTER</a>
      </div>

      <div class="hidden md:flex md:items-center md:space-x-4">
        
        {#if idRol !== null}
          <div class="flex items-baseline space-x-3">

            {#if idRol === 1}
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Áreas</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets</a>
            {/if}

            {#if idRol === 2}
              <a href="/tecnico/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Cola de Trabajo</a>
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Áreas (Personal)</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets (Personal)</a>
            {/if}
            
            {#if idRol === 3}
              <a href="/tecnico/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Cola de Trabajo</a>
              <a href="/admin/reportes" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Reportes</a>
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Áreas (Personal)</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets (Personal)</a>
            {/if}

          </div>
        {/if}

        {#if idRol !== null}
          <div class="flex items-center space-x-3 pl-3 border-l border-white border-opacity-30">
            <span class="text-sm font-medium" title={nombreUsuario}>{nombreUsuario}</span>
            <button
              on:click={handleLogout}
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        {:else}
           <span class="text-sm">Cargando...</span>
        {/if}
      </div>
      
      <div class="-mr-2 flex md:hidden">
        <button on:click={handleLogout} class="bg-red-600 p-2 rounded-md text-white text-sm">Cerrar</Ssr>
      </div>

    </div>
  </div>
</nav>