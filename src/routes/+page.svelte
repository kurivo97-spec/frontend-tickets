<!-- src/routes/+page.svelte (LOGIN - CÓDIGO COMPLETO Y CORREGIDO FINAL) -->

<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Recibe los datos cargados desde +layout.server.js
  export let data;
  // Guarda la URL de la API que viene en 'data'
  const apiUrl = data.apiUrl;

  // Variables del formulario
  let username = '';
  let password = '';
  let isLoading = false;
  let errorLogin = '';

  // Si el usuario ya está logueado (tiene cookie), redirige al dashboard
  onMount(() => {
    if (browser) {
      // Verifica si la cookie 'authToken' existe
      const tokenExists = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='));
      if (tokenExists) {
        // Si hay token, asumimos que está logueado y lo mandamos al dashboard
        // (La validación real del token la harán las páginas protegidas)
        goto('/dashboard');
      }
    }
  });

  // --- FUNCIÓN DE LOGIN (CORREGIDA Y ROBUSTA) ---
  async function handleLogin() {
    isLoading = true;
    errorLogin = '';

    // Verifica que la URL de la API se haya cargado
    if (!apiUrl) {
        errorLogin = 'Error crítico: La URL de la API no está configurada.';
        console.error('apiUrl no está definida:', data); // Log para depuración
        isLoading = false;
        return;
    }

    try {
      // Llamada a la API de Login
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Lee la respuesta como texto para poder depurar
      const responseText = await response.text();

      // Si la respuesta NO fue exitosa (ej: 401, 404, 500)
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`; // Mensaje por defecto
        // Intenta leer el mensaje de error del JSON si la API lo envió
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage; // Usa el error de la API si existe
        } catch (e) {
          // Si la respuesta no era JSON (era HTML o texto plano), usa el texto
          console.warn("La respuesta de error de la API no era JSON:", responseText);
          // Podríamos mostrar 'responseText' directamente, pero a veces es HTML largo
          errorMessage = "Error inesperado del servidor.";
        }
        errorLogin = errorMessage;
        throw new Error(errorMessage); // Detiene la ejecución del try
      }

      // Si la respuesta FUE exitosa (200 OK)
      let responseData = null;
      try {
        // Intentamos parsear el JSON esperado
        responseData = JSON.parse(responseText);
      } catch (e) {
         // Si la API envió 200 OK pero sin JSON válido (¡muy raro!)
         console.error("API devolvió 200 OK pero no era JSON:", responseText);
         errorLogin = "Respuesta inesperada del servidor después del login.";
         throw new Error(errorLogin);
      }


      // Verificamos que el JSON tenga los datos esperados
      if (!responseData || !responseData.token || !responseData.usuario) {
        console.error("Respuesta JSON incompleta:", responseData);
        errorLogin = "Respuesta incompleta del servidor.";
        throw new Error(errorLogin);
      }

      // --- LOGIN EXITOSO ---

      // 1. Guardar token en cookie (expira en 1 día)
      const d = new Date();
      d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      // Asegúrate que el navegador pueda setear la cookie
      if (browser) {
          document.cookie = `authToken=${responseData.token}; ${expires}; path=/; SameSite=Lax`;
          // Guardamos datos del usuario en localStorage
          localStorage.setItem('usuario', JSON.stringify(responseData.usuario));
      } else {
          console.warn("No se pudo guardar la cookie (no estamos en el navegador)");
          // Considera manejar esto si necesitas SSR completo
      }


      // 2. Redirigir según si el perfil está completo
      if (responseData.usuario.datos_actualizados) {
        goto('/dashboard');
      } else {
        goto('/actualizar-perfil');
      }

    } catch (error) {
      // Capturamos cualquier error (de red, JSON, API, etc.)
      console.error("Error detallado en handleLogin:", error);
      // Si errorLogin no se estableció antes, usamos el mensaje genérico
      if (!errorLogin) {
        errorLogin = `Error de conexión: ${error.message}`;
      }
    } finally {
      // Siempre quitamos el estado de carga
      isLoading = false;
    }
  }
</script>

<!-- === HTML DEL FORMULARIO DE LOGIN (SIN CAMBIOS) === -->
<div class="min-h-screen flex items-center justify-center bg-fondo p-4">

  <div class="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md">

    <h1 class="text-3xl font-bold text-center text-oscuro mb-2">
      Sistema de Tickets
    </h1>
    <p class="text-center text-texto mb-8">
      Inicia sesión para continuar
    </p>

    <form on:submit|preventDefault={handleLogin} class="space-y-6">

      <div>
        <label for="username" class="block text-sm font-medium text-texto">
          Usuario
        </label>
        <input
          bind:value={username}
          type="text"
          id="username"
          name="username"
          required
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-principal focus:border-principal sm:text-sm"
          placeholder="tu.usuario"
          disabled={isLoading}
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-texto">
          Contraseña
        </label>
        <input
          bind:value={password}
          type="password"
          id="password"
          name="password"
          required
          class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-principal focus:border-principal sm:text-sm"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      {#if errorLogin}
        <div class="text-red-600 text-sm font-medium text-center p-3 bg-red-50 rounded-lg border border-red-200">
          {errorLogin}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white {isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-principal hover:bg-opacity-85'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal transition-colors duration-200"
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Cargando...
          {:else}
            Ingresar
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
<!-- === FIN DEL HTML === -->