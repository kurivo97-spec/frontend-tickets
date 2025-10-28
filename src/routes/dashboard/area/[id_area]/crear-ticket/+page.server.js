// src/routes/dashboard/area/[id_area]/crear-ticket/+page.server.js

import { PUBLIC_API_URL } from '$env/static/public';
import { error as svelteError } from '@sveltejs/kit';

export async function load({ params }) {
  const idArea = params.id_area; // Obtenemos el ID del área desde la URL

  try {
    // 1. Llamamos al endpoint de configuración (trae TODO: áreas y sub-categorías)
    const response = await fetch(`${PUBLIC_API_URL}/configuracion`);

    if (!response.ok) {
      throw new Error('No se pudieron cargar los datos de configuración desde la API');
    }

    const configData = await response.json();

    // 2. Buscamos el Área específica que coincide con el ID de la URL
    const areaSeleccionada = configData.areas.find(a => a.id_area == idArea);

    if (!areaSeleccionada) {
      // Si no encontramos el área (ej: URL incorrecta), lanzamos un error 404
      throw svelteError(404, 'Área no encontrada');
    }

    // 3. Filtramos las sub-categorías para mostrar solo las de esta Área
    const subcategoriasFiltradas = configData.subcategorias.filter(sc => sc.id_area == idArea);

    // 4. Devolvemos los datos encontrados a la página
    return {
      area: areaSeleccionada,
      subcategorias: subcategoriasFiltradas
    };

  } catch (error) {
    console.error("Error cargando datos para el formulario de ticket:", error);
    // Si es un error 404 de SvelteKit, lo relanzamos
    if (error.status === 404) throw error; 

    // Para otros errores, mostramos un mensaje genérico
    return {
      area: null,
      subcategorias: [],
      error: error.message || 'Error al cargar los datos del formulario'
    };
  }
}