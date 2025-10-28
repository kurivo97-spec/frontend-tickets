<script>
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { page } from '$app/stores'; // Para obtener el ID del ticket de la URL
  import { goto } from '$app/navigation'; // Para redirigir después de subir

  let archivoEvidencia = null; // Guardará el archivo seleccionado
  let isLoading = false;
  let errorApi = '';
  let exito = '';
  let token = null;

  // Obtenemos el ID del ticket desde los parámetros de la URL
  const idTicket = $page.params.id_ticket;

  // Obtenemos el token al cargar (o podrías pasarlo como prop)
  if (browser) {
    token = localStorage.getItem('authToken');
  }

  // --- FUNCIÓN PARA SUBIR LA EVIDENCIA ---
  async function handleUploadEvidencia() {
    if (!archivoEvidencia || !token) {
      errorApi = "Selecciona un archivo y asegúrate de estar autenticado.";
      return;
    }

    isLoading = true;
    errorApi = '';
    exito = '';

    const formData = new FormData();
    // 'evidencia' debe coincidir con upload.single('evidencia') en tu API
    formData.append('evidencia', archivoEvidencia[0]);

    try {
      const response = await fetch(`${env.PUBLIC_API_URL}/tickets/${idTicket}/adjuntar-evidencia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No Content-Type
        },
        body: formData
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al subir evidencia');

      exito = "¡Evidencia subida exitosamente! Redirigiendo a la cola de trabajo...";
      archivoEvidencia = null; // Limpiar input

      // Redirigir de vuelta al dashboard del técnico después de 2 segundos
      setTimeout(() => goto('/tecnico/dashboard'), 2000);

    } catch (err) {
      console.error("Error subiendo evidencia:", err);
      errorApi = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-xl mx-auto p-4 md:p-8">
  <div class="bg-white p-8 rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold text-oscuro mb-4">
      Adjuntar Evidencia para Ticket <span class="text-principal">#{idTicket}</span>
    </h1>
    <p class="text-texto mb-6">
      Sube una foto que demuestre que el trabajo fue completado.
    </p>

    <form class="space-y-4" on:submit|preventDefault={handleUploadEvidencia}>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Foto de Evidencia
        </label>
        <input
          type="file"
          accept="image/*"
          required
          bind:files={archivoEvidencia}
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0 file:text-sm file:font-semibold
                 file:bg-principal file:bg-opacity-10 file:text-principal
                 hover:file:bg-opacity-20 cursor-pointer"
        />
        {#if archivoEvidencia && archivoEvidencia.length > 0}
          <p class="mt-2 text-sm text-gray-500">Archivo seleccionado: {archivoEvidencia[0].name}</p>
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
          disabled={isLoading || !archivoEvidencia}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-principal hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Subiendo...
          {:else}
            Subir Evidencia
          {/if}
        </button>
      </div>
    </form>
     <div class="text-center mt-4">
       <a href="/tecnico/dashboard" class="text-sm text-gray-500 hover:text-principal">Cancelar y volver</a>
     </div>
  </div>
</div>