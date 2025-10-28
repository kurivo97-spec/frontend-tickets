<script>
  export let data;
  $: tickets = data.tickets || [];
  $: errorApi = data.error || null;

  // Importaciones necesarias
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation'; // <-- Importado para redirigir

  let token = null;
  let actionState = {}; // Guarda el estado de acción por ID de ticket ('asignando', 'resolviendo')
  let actionError = {}; // Guarda errores de acción por ID de ticket

  onMount(() => {
    // Obtenemos el token al cargar la página
    if (browser) {
      token = localStorage.getItem('authToken'); // O leer desde cookie si se implementa
    }
  });

  // Función para formatear fechas
  function formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // --- FUNCIÓN ASIGNAR ---
  async function handleAsignar(idTicket) {
    if (!token) return alert('No autenticado'); // Mejorar manejo de errores

    actionState[idTicket] = 'asignando'; // Poner estado 'cargando'
    actionError[idTicket] = '';
    actionState = actionState; // Forzar actualización

    try {
      // Llamamos al endpoint PUT /tickets/:id/asignar
      const response = await fetch(`${env.PUBLIC_API_URL}/tickets/${idTicket}/asignar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` } // Enviamos el token
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al asignar el ticket');

      // Éxito: Actualizamos la lista de tickets localmente
      tickets = tickets.map(t =>
        t.id_ticket === idTicket ? { ...t, nombre_estado: 'En Proceso' } : t
      );
      tickets = tickets; // Forzar actualización

    } catch (err) {
      console.error(`Error asignando ticket ${idTicket}:`, err);
      actionError[idTicket] = err.message; // Mostramos el error
    } finally {
      actionState[idTicket] = ''; // Limpiamos el estado 'cargando'
      actionState = actionState;
      actionError = actionError; // Forzar actualización de errores
    }
  }

  // --- FUNCIÓN RESOLVER (CON REDIRECCIÓN) ---
  async function handleResolver(idTicket) {
    if (!token) return alert('No autenticado');

    actionState[idTicket] = 'resolviendo'; // Poner estado 'cargando'
    actionError[idTicket] = '';
    actionState = actionState;

    try {
      // Llamamos al endpoint PUT /tickets/:id/resolver
      const response = await fetch(`${env.PUBLIC_API_URL}/tickets/${idTicket}/resolver`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` } // Enviamos el token
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al resolver el ticket');

      // Éxito: Actualizamos la lista localmente (o quitamos el ticket)
      // Cambiamos el estado para que visualmente se actualice antes de redirigir
      tickets = tickets.map(t =>
        t.id_ticket === idTicket ? { ...t, nombre_estado: 'Resuelto' } : t
      );
      tickets = tickets; // Forzar actualización

      // ¡REDIRECCIÓN A SUBIR EVIDENCIA!
      goto(`/tecnico/evidencia/${idTicket}`);

    } catch (err) {
      console.error(`Error resolviendo ticket ${idTicket}:`, err);
      actionError[idTicket] = err.message; // Mostramos el error
       // Si falla, quitamos el estado 'cargando' aquí
       actionState[idTicket] = '';
       actionState = actionState;
       actionError = actionError;
    } 
    // No ponemos finally aquí porque la redirección debe ocurrir antes
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