// src/routes/admin/reportes/+page.server.js

import { env } from '$env/dynamic/public';
import { redirect } from '@sveltejs/kit';
import { parse } from 'cookie';

export async function load({ request }) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.authToken;

  if (!token) {
    throw redirect(307, '/'); // Al login si no hay token
  }

  // TODO: Decode token locally to check role *before* calling API (more efficient)
  // For now, we let the API handle the role check.

  try {
    const response = await fetch(`${envPUBLIC_API_URL}/admin/reportes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
         console.error("Acceso denegado a reportes (requiere rol Admin).");
         // Podríamos redirigir al dashboard normal en lugar del login
         throw redirect(307, '/dashboard');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status} de la API`);
    }

    const reportesData = await response.json();

    return {
      reportes: reportesData
    };

  } catch (error) {
     if (error.status >= 300 && error.status < 400) throw error;
    console.error("Error cargando reportes:", error);
    return {
      reportes: null,
      error: error.message
    };
  }
}