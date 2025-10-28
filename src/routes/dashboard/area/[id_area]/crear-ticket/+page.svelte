<script>
  // Importaciones de SvelteKit
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';

  // Recibimos los datos cargados
  export let data;

  // Variables del formulario
  let titulo = '';
  let descripcion = '';
  let prioridad = 'Media';
  let subcategoriaSeleccionada = '';
  let archivos = null;

  // Variables de estado
  let isLoading = false;
  let errorApi = '';
  let exito = '';
  let token = null; // Guardaremos el token aquí

  // --- FUNCIÓN PARA ENVIAR EL TICKET ---
  async function handleSubmit() {
    // Validaciones
    if (!titulo || !descripcion || !prioridad) {
      errorApi = "Por favor completa el título, descripción y prioridad.";
      return;
    }
    if (data.subcategorias && data.subcategorias.length > 0 && !subcategoriaSeleccionada) {
       errorApi = "Por favor selecciona una sub-categoría.";
       return;
    }

    isLoading = true;
    errorApi = '';
    exito = '';

    // Obtenemos el token de autenticación DESDE LA COOKIE
let token = null;
if (browser) {
  // Buscamos la cookie llamada 'authToken'
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('authToken='));
  if (tokenCookie) {
    token = tokenCookie.split('=')[1]; // Extraemos el valor del token
  }
}
// El resto de la función (if (!token) { ... }) sigue igual

    if (!token) {
      errorApi = "No estás autenticado. Por favor, inicia sesión de nuevo.";
      isLoading = false;
      return;
    }

    try {
      // 1. Crear el ticket (texto)
      const response = await fetch(`${env.PUBLIC_API_URL}/tickets/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo, descripcion, prioridad,
          id_area: data.area?.id_area,
          id_subcategoria: subcategoriaSeleccionada ? parseInt(subcategoriaSeleccionada) : null
        })
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al crear el ticket');
      const nuevoTicketId = responseData.id_ticket;

      // 2. Subir fotos (si existen)
      if (archivos && archivos.length > 0) {
        exito = `Ticket #${nuevoTicketId} creado. Subiendo ${archivos.length} foto(s)...`;
        await subirFotos(nuevoTicketId, archivos, token); // Llamamos a la función de subida
      }

      // 3. Éxito final (si no hubo error en subida)
      if (!errorApi) {
          exito = `¡Ticket #${nuevoTicketId} creado exitosamente!`;
      }

      // Limpiar formulario
      titulo = '';
      descripcion = '';
      prioridad = 'Media';
      subcategoriaSeleccionada = '';
      archivos = null;

      // Redirigir
      setTimeout(() => goto('/mis-tickets'), 2000);

    } catch (err) {
      console.error("Error al enviar ticket:", err);
      errorApi = err.message;
    } finally {
      isLoading = false;
    }
  } // <-- FIN DE handleSubmit

  // --- FUNCIÓN PARA SUBIR LAS FOTOS ---
  async function subirFotos(idTicket, files, token) {
    const formData = new FormData();
    try {
      for (const file of files) {
        formData.delete('foto');
        formData.append('foto', file);

        console.log(`Subiendo ${file.name} para ticket #${idTicket}...`);
        const response = await fetch(`${env.PUBLIC_API_URL}/tickets/${idTicket}/adjuntar-foto`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
           const errData = await response.json();
           throw new Error(`Error al subir ${file.name}: ${errData.error || response.statusText}`);
        }
        console.log(`¡${file.name} subida exitosamente!`);
      }
    } catch (err) {
      console.error("Error durante la subida de fotos:", err);
      errorApi = `Ticket creado, pero falló la subida de fotos: ${err.message}`;
      exito = '';
    }
  } // <-- FIN DE subirFotos

</script>

<div class="max-w-3xl mx-auto p-4 md:p-8">

  <div class="mb-6">
    <h1 class="text-3xl md:text-4xl font-bold text-oscuro">
      Generar Nuevo Ticket para:
      <span class="text-principal">{data.area?.nombre_area || 'Área Desconocida'}</span>
    </h1>
    <p class="text-lg text-texto mt-2">
      Por favor, detalla tu solicitud o incidente.
    </p>
  </div>

  {#if data.error}
   <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
     <strong class="font-bold">¡Error al cargar datos!</strong>
     <span class="block sm:inline">{data.error}</span>
   </div>
  {/if}

  <form
    class="p-8 bg-white rounded-xl shadow-lg space-y-6"
    on:submit|preventDefault={handleSubmit}
  >

    <div>
      <label for="titulo" class="block text-sm font-medium text-gray-700">Título / Asunto</label>
      <input id="titulo" type="text" bind:value={titulo} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal" placeholder="Ej: La impresora no funciona"/>
    </div>

    <div>
      <label for="prioridad" class="block text-sm font-medium text-gray-700">Prioridad</label>
      <select id="prioridad" bind:value={prioridad} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal">
        <option value="Baja">Baja</option>
        <option value="Media">Media</option>
        <option value="Alta">Alta</option>
      </select>
    </div>

    {#if data.subcategorias && data.subcategorias.length > 0}
      <div>
        <label for="subcategoria" class="block text-sm font-medium text-gray-700">Sub-categoría</label>
        <select
          id="subcategoria"
          bind:value={subcategoriaSeleccionada}
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal"
        >
          <option value="">-- Selecciona una sub-categoría --</option>
          {#each data.subcategorias as subcat (subcat.id_subcategoria)}
            <option value={subcat.id_subcategoria}>{subcat.nombre_subcategoria}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div>
      <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción Detallada</label>
      <textarea id="descripcion" rows="5" bind:value={descripcion} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal" placeholder="Describe el problema en detalle..."></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Adjuntar Fotos</label>
      <input
        type="file"
        multiple
        accept="image/*"
        bind:files={archivos}
        class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-principal file:bg-opacity-10 file:text-principal hover:file:bg-opacity-20 cursor-pointer"
      />
      {#if archivos && archivos.length > 0}
        <p class="mt-2 text-sm text-gray-500">{archivos.length} archivo(s) seleccionado(s)</p>
      {/if}
    </div>

    {#if errorApi}
      <div class="text-center text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">{errorApi}</div>
    {/if}
    {#if exito}
      <div class="text-center text-sm text-green-600 p-2 bg-green-50 rounded border border-green-200">{exito}</div>
    {/if}

    <div>
      <button
        type="submit"
        disabled={isLoading}
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-principal hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
      >
        {isLoading ? 'Enviando...' : 'Enviar Ticket'}
      </button>
    </div>
  </form>
</div>