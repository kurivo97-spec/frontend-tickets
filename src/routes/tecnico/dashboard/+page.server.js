// src/routes/tecnico/dashboard/+page.server.js

import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { parse } from 'cookie';

export async function load({ request }) {

  // 1. Verificamos el token desde la cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.authToken;

  if (!token) {
    throw redirect(307, '/'); // Al login si no hay token
  }

  try {
    // 2. LLAMAMOS AL ENDPOINT DEL TÉCNICO
    const response = await fetch(`${PUBLIC_API_URL}/tecnico/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Si el token es inválido o no es técnico (401, 403), lo mandamos al login
      if (response.status === 401 || response.status === 403) {
         console.error("Acceso denegado al dashboard de técnico.");
         // Si no es técnico, podríamos mandarlo a /dashboard normal
         // pero por ahora, lo mandamos al login.
         throw redirect(307, '/'); 
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status} de la API`);
    }

    const ticketsCola = await response.json();

    // 3. Devolvemos los tickets de la cola
    return {
      tickets: ticketsCola
    };

  } catch (error) {
     if (error.status >= 300 && error.status < 400) throw error;
    console.error("Error cargando dashboard de técnico:", error);
    return {
      tickets: [],
      error: error.message
    };
  }
}