// src/routes/tickets/[id_ticket]/+page.server.js

import { env } from '$env/dynamic/public';
import { error as svelteError, redirect } from '@sveltejs/kit';
import { parse } from 'cookie';

export async function load({ params, request }) {
  const idTicket = params.id_ticket; // Obtenemos el ID del ticket desde la URL

  // Verificamos autenticación (leemos la cookie)
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.authToken;

  if (!token) {
    throw redirect(307, '/'); // Al login si no hay token
  }

  try {
    // LLAMAMOS A UN NUEVO ENDPOINT DE LA API: /tickets/:id
    const response = await fetch(`${env.PUBLIC_API_URL}/tickets/${idTicket}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
         throw redirect(307, '/'); // Token inválido, al login
      }
      if (response.status === 404) {
          throw svelteError(404, 'Ticket no encontrado');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status} de la API`);
    }

    const ticketData = await response.json();

    // Devolvemos los datos del ticket
    return {
      ticket: ticketData
    };

  } catch (error) {
     // Si es un error 404 o redirección, lo relanzamos
     if (error.status === 404 || (error.status >= 300 && error.status < 400)) {
        throw error;
     }
    console.error(`Error cargando ticket ${idTicket}:`, error);
    // Para otros errores, mostramos mensaje genérico
    throw svelteError(500, error.message || 'Error al cargar los detalles del ticket');
  }
}