// src/routes/+layout.server.js

import { env } from '$env/dynamic/public';

export function load() {
    // Leemos la variable de entorno aquí (en el servidor)
    const apiUrl = env.PUBLIC_API_URL;

    // La devolvemos para que esté disponible en 'data.apiUrl' en las páginas
    return {
        apiUrl: apiUrl
    };
}