<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte'; // Para cargar datos al inicio

  let nombre_completo = '';
  let id_sede = '';
  let id_area_usuario = '';
  let cargo = '';
  let password = ''; // Opcional: Nueva contraseña
  let passwordConfirm = ''; // Confirmación

  let areas = []; // Lista de áreas para el desplegable
  let sedes = []; // Lista de sedes para el desplegable

  let isLoading = false;
  let errorApi = '';
  let exito = '';
  let token = null;

  // Al cargar la página, obtenemos el token y las listas
  onMount(async () => {
    if (browser) {
      token = localStorage.getItem('authToken'); // O leer de cookie más adelante
      if (!token) {
        goto('/'); // Si no hay token, al login
        return;
      }
      // Cargamos las listas de áreas y sedes
      await cargarListas();
    }
  });

  async function cargarListas() {
    try {
      const response = await fetch(`${env.PUBLIC_API_URL}/configuracion`);
      if (!response.ok) throw new Error('Error al cargar configuración');
      const data = await response.json();
      areas = data.areas || [];
      sedes = data.sedes || [];
    } catch (err) {
      errorApi = `Error cargando listas: ${err.message}`;
    }
  }

  async function handleSubmit() {
    if (!nombre_completo || !id_sede || !id_area_usuario || !cargo) {
      errorApi = "Todos los campos (excepto contraseña) son requeridos.";
      return;
    }
    if (password && password !== passwordConfirm) {
        errorApi = "Las contraseñas no coinciden.";
        return;
    }

    isLoading = true;
    errorApi = '';
    exito = '';

    try {
      const payload = {
          nombre_completo,
          id_sede: parseInt(id_sede),
          id_area_usuario: parseInt(id_area_usuario),
          cargo
      };
      if (password) {
          payload.password = password; // Solo enviamos si se escribió una
      }

      const response = await fetch(`${PUBLIC_API_URL}/usuarios/actualizar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar el perfil');
      }

      exito = "¡Perfil actualizado exitosamente! Redirigiendo...";
      
      // Actualizamos la info del usuario en localStorage
      if (browser) {
          const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
          usuarioActual.datos_actualizados = 1; // Marcamos como actualizado
          localStorage.setItem('usuario', JSON.stringify(usuarioActual));
      }

      // Redirigimos al dashboard después de 2 segundos
      setTimeout(() => goto('/dashboard'), 2000);

    } catch (err) {
      console.error("Error actualizando perfil:", err);
      errorApi = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen px-4 bg-fondo">
  <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">

    <div class="text-center">
      <h2 class="text-3xl font-bold text-oscuro">
        Actualizar Perfil
      </h2>
      <p class="text-gray-500">Por favor, completa tus datos para continuar.</p>
    </div>

    <form class="space-y-4" on:submit|preventDefault={handleSubmit}>

      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
        <input id="nombre" type="text" bind:value={nombre_completo} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal"/>
      </div>

      <div>
        <label for="sede" class="block text-sm font-medium text-gray-700">Sede</label>
        <select id="sede" bind:value={id_sede} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal">
          <option value="">-- Selecciona tu Sede --</option>
          {#each sedes as sede (sede.id_sede)}
            <option value={sede.id_sede}>{sede.nombre_sede}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="area" class="block text-sm font-medium text-gray-700">Área / Departamento</label>
        <select id="area" bind:value={id_area_usuario} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal">
          <option value="">-- Selecciona tu Área --</option>
          {#each areas as area (area.id_area)}
            <option value={area.id_area}>{area.nombre_area}</option>
          {/each}
        </select>
      </div>

       <div>
        <label for="cargo" class="block text-sm font-medium text-gray-700">Cargo</label>
        <input id="cargo" type="text" bind:value={cargo} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal"/>
      </div>

      <hr class="border-gray-300"/>

       <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Nueva Contraseña (Opcional)</label>
        <input id="password" type="password" bind:value={password} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal" placeholder="Déjalo en blanco si no quieres cambiarla"/>
      </div>
       <div>
        <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
        <input id="passwordConfirm" type="password" bind:value={passwordConfirm} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-principal focus:border-principal" placeholder="Repite la contraseña si la cambiaste"/>
      </div>


      {#if errorApi}
        <div class="text-center text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">{errorApi}</div>
      {/if}
      {#if exito}
        <div class="text-center text-sm text-green-600 p-2 bg-green-50 rounded border border-green-200">{exito}</div>
      {/if}

      <div>
        <button type="submit" disabled={isLoading} class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-principal hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </div>
    </form>
  </div>
</div>