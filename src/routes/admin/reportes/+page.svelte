<script>
  // Importamos Chart.js y funciones de Svelte
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
  import { onMount, onDestroy, afterUpdate } from 'svelte'; // Añadido afterUpdate

  // --- ¡REGISTRO GLOBAL (ANTES DE onMount)! ---
  // Registramos todos los componentes que usaremos en CUALQUIER gráfico de esta página.
  Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

  // Recibimos los datos cargados
  export let data;
  $: reportes = data.reportes;
  $: errorApi = data.error || null;

  // Variables para las instancias de los gráficos
  let chartEstadoInstance = null;
  let chartAreaInstance = null;

  // Variables para los elementos <canvas> del HTML
  let canvasEstado;
  let canvasArea;

  // Variables para los datos de los gráficos
  let chartDataEstado = {};
  let chartDataArea = {};

  // Opciones para los gráficos
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };
  const optionsArea = { // Opciones específicas para barras (opcional)
    ...options,
    indexAxis: 'y', // Para barras horizontales si se prefiere
    scales: {
        x: { beginAtZero: true } // Asegura que la barra empiece en 0
    }
   };

  // --- FUNCIÓN PARA CREAR O ACTUALIZAR GRÁFICOS ---
  function updateCharts() {
    // Solo si hay datos y los canvas existen
    if (reportes && canvasEstado) {
      // Preparamos datos para gráfico de estado (Dona)
      chartDataEstado = {
        labels: reportes.ticketsPorEstado?.map(item => item.nombre_estado) || [],
        datasets: [{
            label: 'Tickets por Estado',
            data: reportes.ticketsPorEstado?.map(item => item.total) || [],
            backgroundColor: ['#3B82F6','#F59E0B','#10B981','#8B5CF6'], // Azul, Naranja, Verde, Morado
            borderColor: ['#2563EB','#D97706','#059669','#7C3AED'],
            borderWidth: 1,
          },],
      };
      // Destruimos el gráfico anterior si existe
      if (chartEstadoInstance) chartEstadoInstance.destroy();
      // Creamos el nuevo gráfico
      chartEstadoInstance = new Chart(canvasEstado, { type: 'doughnut', data: chartDataEstado, options: options });
    }

    if (reportes && canvasArea) {
      // Preparamos datos para gráfico de área (Barras)
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
      // Destruimos el gráfico anterior si existe
      if (chartAreaInstance) chartAreaInstance.destroy();
      // Creamos el nuevo gráfico
      chartAreaInstance = new Chart(canvasArea, { type: 'bar', data: chartDataArea, options: optionsArea });
    }
  }

  // Usamos afterUpdate para asegurar que los canvas existan en el DOM antes de dibujar
  afterUpdate(() => {
    // Solo llama a updateCharts si los datos ('reportes') han cambiado y ya están disponibles
    if(reportes && !chartEstadoInstance && !chartAreaInstance){ // Evita redibujar innecesariamente
        updateCharts();
    }
  });

  // Destruimos los gráficos al salir de la página
  onDestroy(() => {
    if (chartEstadoInstance) chartEstadoInstance.destroy();
    if (chartAreaInstance) chartAreaInstance.destroy();
  });

  // Helper para formatear promedio (igual)
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