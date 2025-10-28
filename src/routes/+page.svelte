<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { parse, serialize } from 'cookie'; // Para manejar cookies

  let username = '';
  let password = '';
  let error = '';
  let isLoading = false;

  async function handleLogin() {
    error = '';
    isLoading = true;

    try {
      // 1. Llamamos a la API en Render
      const response = await fetch(`${PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // 2. Guardamos el token en una Cookie
      if (browser) {
        document.cookie = serialize('authToken', data.token, {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 día
          sameSite: 'lax'
        });
        // Guardamos info del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }

      // 3. Verificamos si el usuario debe actualizar su perfil y redirigimos
      if (data.usuario.datos_actualizados === 0 || data.usuario.datos_actualizados === false) {
          // ¡Redirigir a la página de actualizar perfil!
          goto('/actualizar-perfil');
      } else {
          // Redirigir al dashboard principal si ya está actualizado
          goto('/dashboard');
      }

    } catch (err) {
      console.error("Error en login:", err); // Añadimos un log para depuración
      error = err.message;
      isLoading = false;
    }
    // No ponemos isLoading = false aquí porque la página redirige
  }
</script>

<div class="flex items-center justify-center min-h-screen px-4 bg-fondo">

  <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">

    <div class="text-center">
      <h2 class="text-3xl font-bold text-oscuro">
        Sistema de Tickets
      </h2>
      <p class="text-gray-500">Inicia sesión para continuar</p>
    </div>

    <form class="space-y-6" on:submit|preventDefault={handleLogin}>

      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={username}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                 placeholder-gray-400
                 focus:outline-none focus:ring-principal focus:border-principal"
          placeholder="tu.usuario"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                 placeholder-gray-400
                 focus:outline-none focus:ring-principal focus:border-principal"
          placeholder="••••••••"
        />
      </div>

      {#if error}
        <div class="text-center text-sm text-red-600">
          {error}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                 shadow-sm text-lg font-medium text-white bg-principal
                 hover:bg-opacity-80
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Cargando...' : 'Ingresar'}
        </button>
      </div>
    </form>

  </div>
</div>