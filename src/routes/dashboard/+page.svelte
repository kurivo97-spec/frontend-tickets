<script>
  // 1. 'data' es una variable especial que SvelteKit nos da
  //    con los datos cargados desde '+page.server.js'
  export let data;

  // (Asignamos los datos a variables locales para que sea más fácil)
  $: areas = data.areas || [];
  $: error = data.error || null;
</script>

<div class="p-4 md:p-8">

  <h1 class="text-3xl md:text-4xl font-bold text-oscuro mb-6">
    Selecciona un Área
  </h1>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">¡Error!</strong>
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

    {#each areas as area (area.id_area)}
      <a 
        href="/dashboard/area/{area.id_area}/crear-ticket"
        class="block p-6 bg-white rounded-xl shadow-lg 
               border border-transparent 
               hover:shadow-2xl hover:border-principal 
               transition-all duration-300 transform hover:-translate-y-1"
      >
        <h2 class="text-2xl font-bold text-principal text-center">
          {area.nombre_area}
        </h2>
        <p class="text-gray-500 text-center mt-2">
          Reportar un incidente o solicitud para {area.nombre_area}
        </p>
      </a>
    {/each}

  </div>
</div>