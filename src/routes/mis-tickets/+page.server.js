// src/routes/mis-tickets/+page.server.js (ACTUALIZADO PARA LEER COOKIES)

import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import { parse } from 'cookie'; // CAMBIO: Importamos 'parse'

export async function load({ request }) { // CAMBIO: Usamos 'request' en lugar de 'cookies'

  // CAMBIO: Leemos las cookies del encabezado de la petición
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.authToken; // Buscamos nuestra cookie 'authToken'

  // Si no hay token, redirigimos al login
  if (!token) {
    throw redirect(307, '/'); // Código 307 para mantener el método (GET)
  }

  try {
    // Llamamos a la API ENVIANDO EL TOKEN
    const response = await fetch(`${env.PUBLIC_API_URL}/mis-tickets`, {
      headers: {
        // ¡Enviamos el token en el encabezado Authorization!
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Si la API devuelve 401 (token inválido) o 403, redirigimos al login
      if (response.status === 401 || response.status === 403) {
         console.error("Token inválido o expirado, redirigiendo al login...");
         throw redirect(307, '/'); 
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status} de la API`);
    }

    const tickets = await response.json();

    return {
      tickets: tickets
    };

  } catch (error) {
     // Si el error es una redirección, la dejamos pasar
     if (error.status >= 300 && error.status < 400) {
        throw error;
     }
    console.error("Error cargando mis tickets:", error);
    return {
      tickets: [],
      error: error.message
    };
  }
}
