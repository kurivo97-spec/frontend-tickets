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
    <div class="hidden md:flex items-center space-x-2 lg:space-x-4">

  <span class="text-sm font-medium hidden lg:inline"> {/* Cambiado a lg:inline */}
    Bienvenido, {nombreUsuario}
  </span>
  <span class="text-gray-500 hidden lg:inline">|</span> {/* Cambiado a lg:inline */}

  <a
    href="/dashboard"
    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
    aria-label="Ir al Dashboard"
    title="Dashboard"
  >
   Áreas
  </a>

  {#if idRol === 1}
    <a href="/mis-tickets" class="...">Mis Tickets</a>
  {:else if idRol === 2}
    <a href="/tecnico/dashboard" class="...">Cola de Trabajo</a>
  {:else if idRol === 3}
    <a href="/tecnico/dashboard" class="...">Cola de Trabajo</a>
    <a href="/admin/reportes" class="...">Reportes</a>
  {/if}

  <button
    on:click={handleLogout}
    class="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 ..."
    aria-label="Cerrar sesión"
  >
    Cerrar Sesión
  </button>
</div>

<div class="-mr-2 flex md:hidden">
   <button on:click={handleLogout} class="bg-red-600 p-2 rounded-md text-white text-sm">Cerrar</button>
   {/* TODO: Implementar menú móvil real aquí */}
 </div>
  </div>
</nav>