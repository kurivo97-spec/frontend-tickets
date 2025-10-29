<script>
  // Importamos Chart.js y funciones de Svelte
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
  import { onDestroy, browser } from 'svelte/internal'; // Usamos 'browser' de internal o 'svelte/environment'

  // --- ¡REGISTRO GLOBAL! ---
  // Registramos todos los componentes necesarios una sola vez.
  Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

  // Recibimos los datos cargados
  export let data;
  $: reportes = data.reportes;
  $: errorApi = data.error || null;

  // Variables para las instancias y los canvas
  let chartEstadoInstance = null;
  let chartAreaInstance = null;
  let canvasEstado; // Se bindea con el <canvas> de Estado
  let canvasArea; // Se bindea con el <canvas> de Área

  // --- ¡LÓGICA REACTIVA! ---
  // Este bloque se ejecutará automáticamente si 'reportes', 'canvasEstado' o 'canvasArea' cambian.
  $: if (browser && reportes && canvasEstado && canvasArea) {
    
    // 1. Preparamos los datos (esto es seguro ejecutarlo múltiples veces)
    const chartDataEstado = {
      labels: reportes.ticketsPorEstado?.map(item => item.nombre_estado) || [],
      datasets: [{
          label: 'Tickets por Estado', data: reportes.ticketsPorEstado?.map(item => item.total) || [],
          backgroundColor: ['#3B82F6','#F59E0B','#10B981','#8B5CF6'], // Azul, Naranja, Verde, Morado
          borderColor: ['#FFFFFF'], borderWidth: 2,
        },],
    };
    
    const chartDataArea = {
      labels: reportes.ticketsPorArea?.map(item => item.nombre_area) || [],
      datasets: [{
          label: 'Total Tickets por Área', data: reportes.ticketsPorArea?.map(item => item.total) || [],
          backgroundColor: 'rgba(92, 184, 138, 0.8)', borderColor: '#5CB88A', borderWidth: 1,
        },],
    };

    const options = { responsive: true, maintainAspectRatio: false };
    const optionsArea = { ...options, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

    // 2. --- ¡LA CLAVE! DESTRUIMOS LOS GRÁFICOS ANTERIORES ---
    if (chartEstadoInstance) {
      chartEstadoInstance.destroy();
    }
    if (chartAreaInstance) {
      chartAreaInstance.destroy();
    }

    // 3. Creamos los nuevos gráficos
    try {
      if (chartDataEstado.labels.length > 0) {
        chartEstadoInstance = new Chart(canvasEstado, {
          type: 'doughnut', data: chartDataEstado, options: options
        });
      }
      if (chartDataArea.labels.length > 0) {
        chartAreaInstance = new Chart(canvasArea, {
          type: 'bar', data: chartDataArea, options: optionsArea
        });
      }
    } catch (e) {
      console.error("Error creando los gráficos:", e);
    }
  }
  // --- Fin del bloque reactivo ---

  // Destruimos los gráficos al salir de la página
  onDestroy(() => {
    if (chartEstadoInstance) chartEstadoInstance.destroy();
    if (chartAreaInstance) chartAreaInstance.destroy();
  });

  // Helper
  function formatAvg(num) {
    if (!num) return 'N/A';
    return parseFloat(num).toFixed(1);
  }
</script>

<div class="max-w-7xl mx-auto p-4 md:p-8">
  <h1 class="text-3xl md:text-4xl font-bold text-oscuro mb-8 text-center">
    Reportes de Administración 📊
  </h1>

  {#if errorApi}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
      <strong class="font-bold">¡Error al cargar!</strong> <span class="block sm:inline">{errorApi}</span>
    </div>
  {:else if !reportes}
    <p class="text-texto text-lg text-center mt-10">Cargando reportes...</p>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <div class="lg:col-span-1 space-y-8">
          <div class="bg-white p-6 rounded-xl shadow-lg h-80 relative flex flex-col">
            <h2 class="text-xl font-semibold text-oscuro mb-4 text-center">Tickets por Estado</h2>
            <div class="flex-grow relative min-h-0">
               {#if reportes.ticketsPorEstado && reportes.ticketsPorEstado.length > 0}
                 <canvas bind:this={canvasEstado}></canvas>
               {:else}
                 <p class="absolute inset-0 flex items-center justify-center text-gray-500">No hay datos.</p>
               {/if}
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-lg text-center">
             <h2 class="text-xl font-semibold text-oscuro mb-2">Satisfacción Promedio</h2>
             <p class="text-5xl font-bold text-acento mt-4">{formatAvg(reportes.calificacionPromedio)} ★</p>
             <p class="text-xs text-gray-500 mt-1">(sobre tickets calificados)</p>
          </div>
      </div>

      <div class="lg:col-span-2 space-y-8">
          <div class="bg-white p-6 rounded-xl shadow-lg h-96 relative flex flex-col">
            <h2 class="text-xl font-semibold text-oscuro mb-4 text-center">Tickets por Área</h2>
            <div class="flex-grow relative min-h-0">
              {#if reportes.ticketsPorArea && reportes.ticketsPorArea.length > 0}
                 <canvas bind:this={canvasArea}></canvas>
              {:else}
                 <p class="absolute inset-0 flex items-center justify-center text-gray-500">No hay datos.</p>
               {/if}
            </div>
          </div>
          {#if reportes.topTecnicos && reportes.topTecnicos.length > 0}
          <div class="bg-white p-6 rounded-xl shadow-lg">
             <h2 class="text-xl font-semibold text-oscuro mb-4">Top Técnicos (Resueltos)</h2>
             <ol class="list-decimal list-inside space-y-2 text-sm">
               {#each reportes.topTecnicos as item}
                 <li class="text-texto">{item.tecnico}: <span class="font-medium">{item.total_resueltos}</span></li>
               {/each}
             </ol>
           </div>
           {/if}
      </div>

    </div> {/if}
</div>