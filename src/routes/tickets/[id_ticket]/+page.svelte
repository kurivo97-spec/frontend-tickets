<script>
  export let data;
  $: ticket = data.ticket || {}; // Datos del ticket
  $: adjuntosSolicitud = ticket.adjuntos?.filter(adj => adj.tipo_adjunto === 'Solicitud') || [];
  // $: adjuntosEvidencia = ticket.adjuntos?.filter(adj => adj.tipo_adjunto === 'Evidencia') || []; // Para el futuro

  // Función para formatear fechas
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
</script>

<div class="max-w-4xl mx-auto p-4 md:p-8">
  {#if ticket.id_ticket}
    <div class="mb-6 pb-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl md:text-4xl font-bold text-oscuro">
          Detalles del Ticket <span class="text-principal">#{ticket.id_ticket}</span>
        </h1>
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                     {ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado' ? 'bg-green-100 text-green-800' :
                      ticket.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'}">
          {ticket.estado}
        </span>
      </div>
      <p class="text-sm text-gray-500 mt-1">Creado: {formatDate(ticket.fecha_creacion)}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="text-xl font-semibold text-oscuro mb-3">Información</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-gray-500">Título:</dt><dd class="text-texto font-medium">{ticket.titulo}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Área:</dt><dd class="text-texto font-medium">{ticket.area}</dd></div>
          {#if ticket.subcategoria}<div class="flex justify-between"><dt class="text-gray-500">Sub-categoría:</dt><dd class="text-texto font-medium">{ticket.subcategoria}</dd></div>{/if}
          <div class="flex justify-between"><dt class="text-gray-500">Prioridad:</dt><dd class="text-texto font-medium">{ticket.prioridad}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Solicitante:</dt><dd class="text-texto font-medium">{ticket.solicitante_nombre} ({ticket.solicitante_cargo})</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Sede:</dt><dd class="text-texto font-medium">{ticket.solicitante_sede}</dd></div>
          {#if ticket.tecnico_nombre}<div class="flex justify-between"><dt class="text-gray-500">Técnico Asignado:</dt><dd class="text-texto font-medium">{ticket.tecnico_nombre}</dd></div>{/if}
          {#if ticket.fecha_resolucion}<div class="flex justify-between"><dt class="text-gray-500">Fecha Resolución:</dt><dd class="text-texto font-medium">{formatDate(ticket.fecha_resolucion)}</dd></div>{/if}
          {#if ticket.fecha_cierre}<div class="flex justify-between"><dt class="text-gray-500">Fecha Cierre:</dt><dd class="text-texto font-medium">{formatDate(ticket.fecha_cierre)}</dd></div>{/if}
          {#if ticket.calificacion}<div class="flex justify-between"><dt class="text-gray-500">Calificación:</dt><dd class="text-acento font-bold">{ticket.calificacion} ★</dd></div>{/if}
        </dl>
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="text-xl font-semibold text-oscuro mb-3">Descripción</h2>
        <p class="text-texto whitespace-pre-wrap">{ticket.descripcion}</p>
      </div>
    </div>

    {#if adjuntosSolicitud.length > 0}
    <div class="bg-white p-6 rounded-xl shadow mb-6">
      <h2 class="text-xl font-semibold text-oscuro mb-3">Fotos Adjuntas (Solicitud)</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each adjuntosSolicitud as adjunto (adjunto.id_adjunto)}
          <a href={adjunto.url_archivo} target="_blank" rel="noopener noreferrer" class="block border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
            <img src={adjunto.url_archivo} alt="Adjunto del ticket" class="w-full h-32 object-cover"/>
            </a>
        {/each}
      </div>
    </div>
    {/if}

    <div class="text-center mt-8">
      <a href="/mis-tickets" class="inline-block px-6 py-2 border border-principal text-principal font-medium rounded-md hover:bg-principal hover:text-white transition-colors">
        ← Volver a Mis Tickets
      </a>
    </div>

  {:else}
    <p class="text-center text-red-600">No se pudo cargar la información del ticket.</p>
  {/if}
</div>