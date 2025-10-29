<script>
  // Importamos Chart.js y onMount/onDestroy de Svelte
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
  import { onMount, onDestroy } from 'svelte';

  // Registramos los elementos necesarios (solo una vez)
  Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

  // Recibimos los datos cargados
  export let data;
  $: reportes = data.reportes;
  $: errorApi = data.error || null;

  // Variables para guardar las instancias de los gráficos
  let chartEstadoInstance = null;
  let chartAreaInstance = null;

  // Variables para los elementos <canvas> del HTML
  let canvasEstado;
  let canvasArea;

  // --- PREPARAMOS DATOS PARA LOS GRÁFICOS (Igual que antes) ---
  let chartDataEstado = {};
  let chartDataArea = {};

  $: {
    if (reportes) {
      chartDataEstado = {
        labels: reportes.ticketsPorEstado?.map(item => item.nombre_estado) || [],
        datasets: [{
            label: 'Tickets',
            data: reportes.ticketsPorEstado?.map(item => item.total) || [],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderWidth: 1,
          },],
      };
      chartDataArea = {
        labels: reportes.ticketsPorArea?.map(item => item.nombre_area) || [],
        datasets: [{
            label: 'Total Tickets por Área',
            data: reportes.ticketsPorArea?.map(item => item.total) || [],
            backgroundColor: 'rgba(92, 184, 138, 0.7)', // Verde principal
            borderColor: '#5CB88A',
            borderWidth: 1,
          },],
      };
    }
  }

  // Opciones para los gráficos (igual que antes)
  const optionsEstado = { responsive: true, maintainAspectRatio: false };
  const optionsArea = { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }; // Barras horizontales opcional

  // --- CREAMOS LOS GRÁFICOS CUANDO EL COMPONENTE SE MONTA ---
  onMount(() => {
    // Solo creamos los gráficos si hay datos y los canvas existen
    if (reportes && canvasEstado && chartDataEstado.labels?.length > 0) {
      chartEstadoInstance = new Chart(canvasEstado, {
        type: 'doughnut', // Tipo Dona
        data: chartDataEstado,
        options: optionsEstado
      });
    }
    if (reportes && canvasArea && chartDataArea.labels?.length > 0) {
      chartAreaInstance = new Chart(canvasArea, {
        type: 'bar', // Tipo Barras
        data: chartDataArea,
        options: optionsArea
      });
    }
  });

  // --- DESTRUIMOS LOS GRÁFICOS AL DESMONTAR PARA EVITAR FUGAS DE MEMORIA ---
  onDestroy(() => {
    if (chartEstadoInstance) {
      chartEstadoInstance.destroy();
    }
    if (chartAreaInstance) {
      chartAreaInstance.destroy();
    }
  });


  // Helper para formatear números decimales (igual que antes)
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
         <div class="bg-white p-6 rounded-xl shadow-lg h-80 relative"> 
            <h2 class="text-xl font-semibold text-oscuro mb-4 text-center">Tickets por Estado</h2>
            {#if chartDataEstado.labels && chartDataEstado.labels.length > 0}
               <canvas bind:this={canvasEstado}></canvas>
            {:else}
               <p class="text-center text-gray-500 mt-10">No hay datos de estado.</p>
            {/if}
          </div>

          <div class="bg-white p-6 rounded-xl shadow-lg text-center">
             <h2 class="text-xl font-semibold text-oscuro mb-2">Satisfacción Promedio</h2>
             <p class="text-5xl font-bold text-acento mt-4">{formatAvg(reportes.calificacionPromedio)} ★</p>
             <p class="text-xs text-gray-500 mt-1">(sobre tickets calificados)</p>
          </div>
      </div>

      <div class="lg:col-span-2 space-y-8">
         <div class="bg-white p-6 rounded-xl shadow-lg h-96 relative"> 
            <h2 class="text-xl font-semibold text-oscuro mb-4 text-center">Tickets por Área</h2>
             {#if chartDataArea.labels && chartDataArea.labels.length > 0}
                <canvas bind:this={canvasArea}></canvas>
             {:else}
                <p class="text-center text-gray-500 mt-10">No hay datos de áreas.</p>
             {/if}
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