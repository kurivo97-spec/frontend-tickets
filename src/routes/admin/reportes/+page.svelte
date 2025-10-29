<script>
  // Importamos Chart.js y funciones de Svelte
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
  import { onMount, onDestroy } from 'svelte';

  // NO registramos aquí
  
  // Recibimos los datos cargados
  export let data;
  $: reportes = data.reportes;
  $: errorApi = data.error || null;

  // Variables para las instancias y los canvas
  let chartEstadoInstance = null;
  let chartAreaInstance = null;
  let canvasEstado;
  let canvasArea;

  // Opciones
  const options = { responsive: true, maintainAspectRatio: false };
  const optionsArea = { ...options, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

  // --- CREAMOS GRÁFICOS CUANDO EL COMPONENTE SE MONTA ---
  onMount(() => {
    // --- ¡REGISTRAMOS LOS COMPONENTES AQUÍ DENTRO! ---
    // Esto asegura que se registren en el navegador antes de usarlos.
    try {
      Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);
    } catch (e) {
      console.error("Error al registrar Chart.js:", e);
    }
    // --- Fin del Registro ---

    // Ahora intentamos crear los gráficos
    if (reportes && canvasEstado) {
      const chartDataEstado = {
        labels: reportes.ticketsPorEstado?.map(item => item.nombre_estado) || [],
        datasets: [{
            label: 'Tickets por Estado', data: reportes.ticketsPorEstado?.map(item => item.total) || [],
            backgroundColor: ['#3B82F6','#F59E0B','#10B981','#8B5CF6'],
            borderColor: ['#2563EB','#D97706','#059669','#7C3AED'], borderWidth: 1,
          },],
      };
      if (chartEstadoInstance) chartEstadoInstance.destroy();
      chartEstadoInstance = new Chart(canvasEstado, { type: 'doughnut', data: chartDataEstado, options: options });
    }

    if (reportes && canvasArea) {
      const chartDataArea = {
        labels: reportes.ticketsPorArea?.map(item => item.nombre_area) || [],
        datasets: [{
            label: 'Total Tickets por Área', data: reportes.ticketsPorArea?.map(item => item.total) || [],
            backgroundColor: 'rgba(92, 184, 138, 0.7)', borderColor: '#5CB88A', borderWidth: 1,
          },],
      };
      if (chartAreaInstance) chartAreaInstance.destroy();
      chartAreaInstance = new Chart(canvasArea, { type: 'bar', data: chartDataArea, options: optionsArea });
    }
  });

  // Destruimos al salir
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
            <div class="flex-grow relative">
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
            <div class="flex-grow relative">
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