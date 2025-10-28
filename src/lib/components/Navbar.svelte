<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let nombreUsuario = 'Usuario';
  let idRol = 1; // Por defecto, rol 1 (Solicitante)

  onMount(() => {
    // Lee los datos del usuario desde localStorage al cargar
    if (browser) {
      const usuarioData = localStorage.getItem('usuario');
      if (usuarioData) {
        try {
          const usuario = JSON.parse(usuarioData);
          nombreUsuario = usuario.nombre || 'Usuario';
          idRol = usuario.id_rol || 1; // Lee el rol
        } catch (e) {
          console.error("Error al parsear datos de usuario:", e);
        }
      } else {
         handleLogout(); // Cierra sesión si no hay datos
      }
    }
  });

  // Función para cerrar sesión
  function handleLogout() {
    if (browser) {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.removeItem('usuario');
      goto('/');
    }
  }
</script>

<nav class="bg-oscuro text-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <div class="flex-shrink-0">
        <a href="/dashboard" class="text-xl font-bold hover:text-principal transition-colors">
          CENDIDTER Tickets
        </a>
      </div>

      <div class="flex items-center space-x-4">

        <span class="text-sm font-medium hidden md:inline">
          Bienvenido, {nombreUsuario}
        </span>
        <span class="text-gray-500 hidden md:inline">|</span>

        <a
          href="/dashboard"
          class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
          aria-label="Ir al Dashboard"
          title="Dashboard"
        >
         Áreas
        </a>

        {#if idRol === 1}
          <a
            href="/mis-tickets"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
          >
            Mis Tickets
          </a>
        {:else if idRol === 2}
          <a
            href="/tecnico/dashboard"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
          >
            Cola de Trabajo
          </a>
        {:else if idRol === 3}
          <a
            href="/tecnico/dashboard"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
          >
            Cola de Trabajo
          </a>
          <a
            href="/admin/reportes"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-principal hover:bg-opacity-20 transition-colors"
          >
            Reportes
          </a>
        {/if}

        <button
          on:click={handleLogout}
          class="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-oscuro focus:ring-red-500"
          aria-label="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
      </div>

    </div>
  </div>
</nav>