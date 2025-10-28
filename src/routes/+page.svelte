<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Variables para el formulario
  let username = '';
  let password = '';
  let isLoading = false;
  let errorLogin = '';

  // Variable de entorno de la API
  const PUBLIC_API_URL = import.meta.env.VITE_PUBLIC_API_URL;

  // Si el usuario ya está logueado, redirigir al dashboard
  onMount(() => {
    if (browser) {
      const token = document.cookie.includes('authToken=');
      if (token) {
        goto('/dashboard');
      }
    }
  });

  // --- FUNCIÓN DE LOGIN (CORREGIDA) ---
  async function handleLogin() {
    isLoading = true;
    errorLogin = '';

    try {
      const response = await fetch(`${env.PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      // Intenta leer la respuesta como JSON
      const data = await response.json();

      if (response.ok) {
        // --- ¡AQUÍ ESTABA EL ERROR PROBABLEMENTE! ---
        
        // 1. Guardar el token en las cookies
        // (Settea la cookie para que expire en 1 día)
        const d = new Date();
        d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `authToken=${data.token}; ${expires}; path=/; SameSite=Lax`;

        // 2. Guardar los datos del usuario en localStorage
        // Nos aseguramos de acceder a 'data.usuario' (con 'u')
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        // 3. Redirigir según si el perfil está completo
        // Nos aseguramos de leer 'data.usuario.datos_actualizados'
        if (data.usuario.datos_actualizados) {
          goto('/dashboard');
        } else {
          goto('/actualizar-perfil');
        }
        
      } else {
        // Si la API devuelve un error (ej: 401, 404)
        errorLogin = data.error || 'Error desconocido al iniciar sesión.';
      }

    } catch (error) {
      // Si hay un error de red o un JSON mal formado (como antes)
      console.error("Error en handleLogin:", error);
      errorLogin = `Error en la conexión: ${error.message}. ¿Está la API en línea?`;
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