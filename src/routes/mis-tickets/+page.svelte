<script>
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation'; // Importar goto para el link de "Ver Detalles"

  export let data;
  $: tickets = data.tickets || [];
  $: errorApi = data.error || null;

  let isLoadingRating = {};
  let ratingError = {};
  let token = null;

  onMount(() => {
    if (browser) {
      token = localStorage.getItem('authToken');
    }
  });

  // Función para formatear fechas
  function formatDate(dateString) {
     if (!dateString) return '-';
     const date = new Date(dateString);
     return date.toLocaleDateString('es-CO', {
       year: 'numeric', month: 'short', day: 'numeric',
       hour: 'numeric', minute: '2-digit', hour12: true
     });
  }

  // src/routes/mis-tickets/+page.svelte

// --- FUNCIÓN CALIFICAR (CORREGIDA) ---
async function handleRateTicket(idTicket, puntuacion) {
  // Leemos el token DESDE LA COOKIE aquí DENTRO
  let token = null;
  if (browser) {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('authToken='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  // Verificamos si el token se encontró
  if (!token) {
    ratingError[idTicket] = 'No autenticado.'; // Muestra el error
    isLoadingRating[idTicket] = false; // Asegura quitar spinner si falla aquí
    ratingError = ratingError;
    isLoadingRating = isLoadingRating;
    return; // Detiene la función
  }

  // El resto de la función (isLoadingRating = true, try/catch, etc.) sigue igual...
  isLoadingRating[idTicket] = puntuacion;
  ratingError[idTicket] = '';
  isLoadingRating = isLoadingRating;
  ratingError = ratingError;

  try {
    // ... (fetch a /tickets/:id/calificar sigue igual) ...
    const response = await fetch(`${apiUrl}/tickets/${idTicket}/calificar`, { /*...*/ });
    // ... (manejo de respuesta sigue igual) ...
  } catch (err) {
    // ... (catch sigue igual) ...
  } finally {
    // ... (finally sigue igual) ...
  }
}

</script>

<div class="max-w-7xl mx-auto p-4 md:p-8">
  <h1 class="text-3xl md:text-4xl font-bold text-oscuro mb-6">
    Mis Tickets Enviados
  </h1>

  {#if errorApi}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
      <strong class="font-bold">¡Error al cargar!</strong>
      <span class="block sm:inline">{errorApi}</span>
    </div>
  {:else if tickets.length === 0}
    <p class="text-texto text-lg text-center mt-10">No has enviado ningún ticket todavía.</p>
    <div class="text-center mt-4">
       <a href="/dashboard" class="text-principal hover:underline">Crear un nuevo ticket</a>
    </div>
  {:else}
    <div class="bg-white rounded-xl shadow-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-fondo">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Título</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Área</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Prioridad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-texto uppercase tracking-wider">Fecha Creación</th>
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
                {ticket.nombre_area}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                             {ticket.nombre_estado === 'Resuelto' || ticket.nombre_estado === 'Cerrado' ? 'bg-green-100 text-green-800' :
                              ticket.nombre_estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}">
                  {ticket.nombre_estado}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-texto">
                <span class="{ticket.prioridad === 'Alta' ? 'text-red-600 font-semibold' : ticket.prioridad === 'Media' ? 'text-yellow-600' : ''}">
                  {ticket.prioridad}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(ticket.fecha_creacion)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {#if ticket.nombre_estado === 'Resuelto'}
  <div>
    <div class="flex items-center space-x-1">
      {#each [1, 2, 3, 4, 5] as stars}
        <button
          on:click={() => handleRateTicket(ticket.id_ticket, stars)}
          disabled={!!isLoadingRating[ticket.id_ticket]}
          class="text-xl text-acento hover:text-yellow-500 disabled:opacity-50 disabled:cursor-wait transition-colors focus:outline-none"
          aria-label={`Calificar con ${stars} estrellas`}
        >
          {#if isLoadingRating[ticket.id_ticket] === stars}
            <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {:else}
            ★
          {/if}
        </button>
      {/each}
    </div>
    {#if ratingError[ticket.id_ticket]}
      <p class="text-xs text-red-600 mt-1">{ratingError[ticket.id_ticket]}</p>
    {/if}
  </div>

  <a href="/tickets/{ticket.id_ticket}" class="mt-2 inline-block text-xs text-principal hover:text-oscuro hover:underline">
    Ver Detalles
  </a>
  {:else if ticket.nombre_estado === 'Cerrado' && ticket.calificacion}
  {:else}
  <a href="/tickets/{ticket.id_ticket}" class="text-principal hover:text-oscuro hover:underline">Ver Detalles</a>
{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>