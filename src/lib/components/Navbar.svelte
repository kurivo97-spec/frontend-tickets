<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Variables para mostrar los datos del usuario
  let nombreUsuario = 'Cargando...';
  let idRol = null; // Empezamos en null para saber si ya cargó

  /**
   * Cierra la sesión del usuario: borra cookie y localStorage,
   * y redirige al login.
   */
  function handleLogout() {
    if (browser) {
      // Borra la cookie del token
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      // Borra los datos del usuario
      localStorage.removeItem('usuario');
      // Redirige al login
      goto('/');
    }
  }

  // onMount se ejecuta SOLO en el navegador (browser)
  onMount(() => {
    // Verificamos 'if (browser)' por si acaso, aunque onMount ya lo garantiza
    if (browser) {
      const usuarioData = localStorage.getItem('usuario');

      if (usuarioData) {
        // Si encontramos datos, los parseamos
        try {
          const usuario = JSON.parse(usuarioData);
          nombreUsuario = usuario.nombre || 'Usuario'; // Asigna el nombre
          idRol = usuario.id_rol || 1; // Asigna el rol (1 por defecto si falla)
        } catch (e) {
          // Si los datos en localStorage están corruptos (JSON inválido)
          console.error("Error al parsear datos de usuario desde localStorage:", e);
          handleLogout(); // Cierra la sesión
        }
      } else {
        // Si no hay datos en localStorage (sesión inválida o incompleta)
        console.warn("No se encontraron datos de 'usuario' en localStorage. Cerrando sesión.");
        handleLogout(); // Cierra la sesión
      }
    }
  });

</script>

<nav class="bg-principal text-white shadow-lg sticky top-0 z-50">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <div class="flex-shrink-0">
        <a href="/dashboard" class="text-xl font-bold hover:opacity-80 transition-opacity">Tickets CENDIDTER</a>
      </div>

      {#if idRol !== null}
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">

            {#if idRol === 1}
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Crear Ticket</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets</a>
            {/if}

            {#if idRol === 2}
              <a href="/tecnico/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Cola de Trabajo</a>
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Crear (Personal)</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets (Personal)</a>
            {/if}
            
            {#if idRol === 3}
              <a href="/tecnico/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Cola de Trabajo</a>
              <a href="/admin/reportes" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Reportes</a>
              <a href="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Crear (Personal)</a>
              <a href="/mis-tickets" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-acento transition-colors">Mis Tickets (Personal)</a>
            {/if}

          </div>
        </div>
      {/if}

      <div class="hidden md:block">
        {#if idRol !== null}
          <div class="ml-4 flex items-center md:ml-6">
            <span class="text-sm mr-3">Hola, {nombreUsuario}</span>
            <button
              on:click={handleLogout}
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        {:else}
           <span class="text-sm mr-3">Cargando...</span>
        {/if}
      </div>
      
      <div class="-mr-2 flex md:hidden">
        <button on:click={handleLogout} class="bg-red-600 p-2 rounded-md text-white text-sm">Cerrar</button>
      </div>

    </div>
  </div>
</nav>