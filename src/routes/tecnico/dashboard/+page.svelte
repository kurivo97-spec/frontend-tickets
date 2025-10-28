<script>
  // 'data' viene de +page.server.js
  export let data;
  $: tickets = data.tickets || [];
  $: errorApi = data.error || null;

  // Importaciones necesarias
  import { browser } from '$app/environment';
  // 'env' es para la API URL, pero 'apiUrl' ya viene en 'data'
  // import { env } from '$env/dynamic/public'; 
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Usamos la URL de la API que viene de +layout.server.js
  const apiUrl = data.apiUrl; 
  
  let token = null;
  let actionState = {}; // Guarda el estado de acción por ID de ticket ('asignando', 'resolviendo')
  let actionError = {}; // Guarda errores de acción por ID de ticket

  onMount(() => {
    // --- ¡CORRECCIÓN AQUÍ! ---
    // Obtenemos el token al cargar la página (desde la COOKIE)
    if (browser) {
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(row => row.startsWith('authToken='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      } else {
        console.error("No se encontró la cookie de autenticación.");
        // Si no hay cookie, no debería estar en esta página
        goto('/'); 
      }
    }
  });

  // Función para formatear fechas
  function formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // --- FUNCIÓN ASIGNAR (CORREGIDA) ---
  async function handleAsignar(idTicket) {
    if (!token) {
        actionError[idTicket] = 'No autenticado. Recargando...';
        actionError = actionError;
        setTimeout(() => location.reload(), 1500); // Recarga si se pierde el token
        return;
    }
    if (!apiUrl) {
        actionError[idTicket] = 'Error: URL de API no cargada.';
        actionError = actionError;
        return;
    }

    actionState[idTicket] = 'asignando';
    actionError[idTicket] = '';
    actionState = actionState;

    try {
      // Usamos la variable 'apiUrl'
      const response = await fetch(`${apiUrl}/tickets/${idTicket}/asignar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al asignar');

      // Éxito: Actualizamos la lista localmente
      tickets = tickets.map(t =>
        t.id_ticket === idTicket ? { ...t, nombre_estado: 'En Proceso' } : t
      );
      tickets = tickets;

    } catch (err) {
      console.error(`Error asignando ticket ${idTicket}:`, err);
      actionError[idTicket] = err.message;
    } finally {
      actionState[idTicket] = '';
      actionState = actionState;
      actionError = actionError;
    }
  }

  // --- FUNCIÓN RESOLVER (CORREGIDA) ---
  async function handleResolver(idTicket) {
    if (!token) {
        actionError[idTicket] = 'No autenticado. Recargando...';
        actionError = actionError;
        setTimeout(() => location.reload(), 1500);
        return;
    }
    if (!apiUrl) {
        actionError[idTicket] = 'Error: URL de API no cargada.';
        actionError = actionError;
        return;
    }

    actionState[idTicket] = 'resolviendo';
    actionError[idTicket] = '';
    actionState = actionState;

    try {
      // Usamos la variable 'apiUrl'
      const response = await fetch(`${apiUrl}/tickets/${idTicket}/resolver`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al resolver');

      // Éxito: Redirigimos a subir evidencia
      goto(`/tecnico/evidencia/${idTicket}`);
      // No necesitamos actualizar el estado localmente si vamos a redirigir

    } catch (err) {
      console.error(`Error resolviendo ticket ${idTicket}:`, err);
      actionError[idTicket] = err.message;
      actionState[idTicket] = ''; // Limpiamos estado solo si hay error
      actionState = actionState;
      actionError = actionError;
    }
    // No hay 'finally' porque no queremos limpiar el estado si la redirección es exitosa
  }
</script>

<div class="max-w-7xl mx-auto p-4 md:p-8">
  <h1 class="text-3xl md:text-4xl font-bold text-oscuro mb-6">
    Cola de Trabajo (Mi Área)
  </h1>

  {#if errorApi}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <strong class="font-bold">¡Error al cargar!</strong>
      <span class="block sm:inline">{errorApi}</span>
    </div>
  {:else if tickets.length === 0}
    <p class="text-texto text-lg text-center mt-10">
      ¡Felicidades! No hay tickets pendientes en tu área.
    </p>
  {:else}
    <div class="bg-white rounded-xl shadow-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-fondo">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Solicitante</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Sede</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Sub-Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Prioridad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each tickets as ticket (ticket.id_ticket)}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-principal">
                #{ticket.id_ticket}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-texto max-w-xs truncate" title={ticket.titulo}>
                {ticket.titulo}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-texto">
                {ticket.solicitante_nombre}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-texto">
                {ticket.nombre_sede}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-texto">
                {ticket.nombre_subcategoria || '-'}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                             {ticket.nombre_estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.nombre_estado === 'Resuelto' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'}">
                  {ticket.nombre_estado}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="{ticket.prioridad === 'Alta' ? 'text-red-600 font-semibold' : ticket.prioridad === 'Media' ? 'text-yellow-600' : ''}">
                  {ticket.prioridad}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {#if ticket.nombre_estado === 'Recibido'}
                  <button
                    on:click={() => handleAsignar(ticket.id_ticket)}
                    disabled={actionState[ticket.id_ticket] === 'asignando'}
                    class="text-white bg-principal hover:bg-opacity-80 px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-wait transition-colors"
                  >
                    {#if actionState[ticket.id_ticket] === 'asignando'}
                        <svg class="animate-spin inline h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {/if}
                    Asignarme
                  </button>
                {:else if ticket.nombre_estado === 'En Proceso'}
                  <button
                    on:click={() => handleResolver(ticket.id_ticket)}
                    disabled={actionState[ticket.id_ticket] === 'resolviendo'}
                    class="text-white bg-acento hover:bg-opacity-80 px-3 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-wait transition-colors"
                  >
                    {#if actionState[ticket.id_ticket] === 'resolviendo'}
                        <svg class="animate-spin inline h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {/if}
                    Resolver
                  </button>
                {/if}
                {#if actionError[ticket.id_ticket]}
                  <p class="text-xs text-red-600 mt-1">{actionError[ticket.id_ticket]}</p>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>