

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