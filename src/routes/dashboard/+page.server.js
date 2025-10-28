// src/routes/dashboard/+page.server.js

// Importamos la URL de la API desde el .env
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  // (En el futuro, aquí revisaremos el token del usuario para proteger la ruta)
  // const token = cookies.get('authToken');
  // if (!token) {
  //   throw redirect(307, '/'); // Redirige al login si no hay token
  // }

  try {
    // 1. Llamamos al endpoint de configuración que creamos en el Hito 3
    const response = await fetch(`${PUBLIC_API_URL}/configuracion`);

    if (!response.ok) {
      throw new Error('No se pudieron cargar los datos de configuración desde la API');
    }

    const configData = await response.json();

    // 2. Devolvemos solo las áreas, que es lo que esta página necesita
    return {
      areas: configData.areas
    };

  } catch (error) {
    console.error("Error cargando datos para el dashboard:", error);
    return {
      areas: [], // Devolvemos un array vacío en caso de error
      error: error.message
    };
  }
}