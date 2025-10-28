
// src/routes/+page.svelte

// ... (asegúrate de que el <script> empiece así)
<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data; // Recibe los datos del layout.server.js
  const apiUrl = data.apiUrl; // Guarda la URL de la API

  let username = '';
  let password = '';
  let isLoading = false;
  let errorLogin = '';

  // onMount sigue igual...
  onMount(() => {
    if (browser) {
      const token = document.cookie.includes('authToken=');
      if (token) {
        goto('/dashboard');
      }
    }
  });

  // --- PEGA ESTA FUNCIÓN COMPLETA ---
  async function handleLogin() {
    isLoading = true;
    errorLogin = '';

    if (!apiUrl) {
        errorLogin = 'Error crítico: La URL de la API no está configurada.';
        isLoading = false;
        return;
    }

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Lee la respuesta (puede ser JSON o texto de error)
      const responseText = await response.text();

      if (!response.ok) {
        // Intenta leer el error del JSON si lo hay
        try {
          const errorData = JSON.parse(responseText);
          errorLogin = errorData.error || 'Error desconocido del servidor.';
        } catch (e) {
          errorLogin = `Error en la API (Respuesta no-JSON): ${responseText}`;
        }
        throw new Error(errorLogin);
      }

      // Si response.ok, PARSEAMOS el JSON
      const responseData = JSON.parse(responseText);

      // ¡¡AQUÍ ESTÁ LA LÓGICA CRÍTICA!!
      // Asegúrate de usar 'responseData.usuario'
      if (!responseData.usuario) {
        throw new Error("La API no devolvió un objeto 'usuario'.");
      }

      // 1. Guardar token
      const d = new Date();
      d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      document.cookie = `authToken=${responseData.token}; ${expires}; path=/; SameSite=Lax`;

      // 2. Guardar usuario
      localStorage.setItem('usuario', JSON.stringify(responseData.usuario));

      // 3. Redirigir usando 'responseData.usuario.datos_actualizados'
      if (responseData.usuario.datos_actualizados) {
        goto('/dashboard');
      } else {
        goto('/actualizar-perfil');
      }

    } catch (error) {
      console.error("Error en handleLogin:", error);
      if (!errorLogin) { // Si el error no fue seteado arriba
        errorLogin = `Error de red o conexión: ${error.message}`;
      }
    } finally {
      isLoading = false;
    }
  }
</script>
<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  
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
        <div class="text-red-600 text-sm font-medium text-center p-3 bg-red-50 rounded-lg">
          {errorLogin}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white {isLoading ? 'bg-gray-400' : 'bg-principal hover:bg-acento'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal transition-colors duration-200"
          disabled={isLoading}
        >
          {#if isLoading}
            Cargando...
          {:else}
            Ingresar
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>