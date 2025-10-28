// src/routes/tecnico/evidencia/[id_ticket]/+page.svelte (SCRIPT CORREGIDO)

<script>
  import { browser } from '$app/environment';
  import { PUBLIC_API_URL } from '$env/static/public'; // Usamos static aquí porque la URL no cambiará
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte'; // onMount sigue siendo útil

  let archivoEvidencia = null; // Guardará el FileList
  let isLoading = false;
  let errorApi = '';
  let exito = '';
  // BORRAMOS: let token = null; // Ya no lo guardamos globalmente

  // Obtenemos el ID del ticket desde los parámetros de la URL
  const idTicket = $page.params.id_ticket;

  // --- FUNCIÓN PARA SUBIR LA EVIDENCIA (CORREGIDA) ---
  async function handleUploadEvidencia() {
    // Leemos el token DESDE LA COOKIE aquí DENTRO
    let token = null;
    if (browser) {
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find(row => row.startsWith('authToken='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }

    // Verificamos archivo Y token
    if (!archivoEvidencia || archivoEvidencia.length === 0) {
      errorApi = "Por favor, selecciona un archivo de evidencia.";
      return; // Detiene si no hay archivo
    }
    if (!token) {
      errorApi = "No estás autenticado. Por favor, inicia sesión de nuevo.";
      isLoading = false; // Asegúrate de resetear isLoading si falla aquí
      // Podríamos redirigir: await goto('/');
      return; // Detiene si no hay token
    }


    isLoading = true;
    errorApi = '';
    exito = '';

    const formData = new FormData();
    // 'evidencia' debe coincidir con upload.single('evidencia') en tu API
    formData.append('evidencia', archivoEvidencia[0]); // Tomamos el primer archivo

    try {
      const response = await fetch(`${PUBLIC_API_URL}/tickets/${idTicket}/adjuntar-evidencia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No Content-Type con FormData
        },
        body: formData
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Error al subir evidencia');

      exito = "¡Evidencia subida exitosamente! Redirigiendo...";
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