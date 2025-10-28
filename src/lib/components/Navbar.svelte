<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let nombreUsuario = 'Usuario';
  let idRol = 1; 

  // onMount(() => {
  //   if (browser) {
  //     const usuarioData = localStorage.getItem('usuario');
  //     if (usuarioData) {
  //       try {
  //         const usuario = JSON.parse(usuarioData);
  //         nombreUsuario = usuario.nombre || 'Usuario';
  //         idRol = usuario.id_rol || 1; 
  //       } catch (e) {
  //         console.error("Error al parsear datos de usuario:", e);
  //       }
  //     } else {
  //        handleLogout(); 
  //     }
  //   }
  // }); // <-- Comentado todo el onMount

  function handleLogout() {
    if (browser) {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.removeItem('usuario'); // Esto está bien aquí
      goto('/');
    }
  }
</script>