<script>
  // Recibimos los datos cargados desde +page.server.js
  export let data;
  $: reportes = data.reportes;
  $: errorApi = data.error || null;

  // Helper para formatear números decimales (ej: 4.5)
  function formatAvg(num) {
    // Si num es null, undefined o 0, devuelve 'N/A'
    if (!num) return 'N/A';
    // Convierte a número, lo limita a 1 decimal y lo devuelve como string
    return parseFloat(num).toFixed(1);
  }
</script>

<div class="max-w-7xl mx-auto p-4 md:p-8">
  <h1 class="text-3xl md:text-4xl font-bold text-oscuro mb-6">
    Reportes de Administración 📊
  </h1>

  {#if errorApi}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <strong class="font-bold">¡Error al cargar!</strong>
      <span class="block sm:inline">{errorApi}</span>
    </div>
  {:else if !reportes}
    <p class="text-texto text-lg text-center mt-10">Cargando reportes...</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold text-oscuro mb-4">Tickets por Estado</h2>
        <ul class="space-y-2">
          {#each reportes.ticketsPorEstado || [] as item}
            <li class="flex justify-between text-texto text-sm">
              <span>{item.nombre_estado}:</span>
              <span class="font-medium">{item.total}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold text-oscuro mb-4">Tickets por Área</h2>
        <ul class="space-y-2">
          {#each reportes.ticketsPorArea || [] as item}
            <li class="flex justify-between text-texto text-sm">
              <span>{item.nombre_area}:</span>
              <span class="font-medium">{item.total}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 class="text-xl font-semibold text-oscuro mb-2">Satisfacción Promedio</h2>
        <p class="text-5xl font-bold text-acento mt-4">
          {formatAvg(reportes.calificacionPromedio)} ★
        </p>
        <p class="text-xs text-gray-500 mt-1">(sobre tickets calificados)</p>
      </div>

      {#if reportes.topTecnicos && reportes.topTecnicos.length > 0}
      <div class="bg-white p-6 rounded-xl shadow-lg md:col-span-2 lg:col-span-1">
         <h2 class="text-xl font-semibold text-oscuro mb-4">Top Técnicos (Resueltos)</h2>
         <ol class="list-decimal list-inside space-y-2 text-sm">
           {#each reportes.topTecnicos as item}
             <li class="text-texto">
               {item.tecnico}: <span class="font-medium">{item.total_resueltos}</span>
             </li>
           {/each}
         </ol>
       </div>
       {/if}

    </div> {/if}
</div>