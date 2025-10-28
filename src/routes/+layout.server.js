// src/routes/+layout.server.js

import { env } from '$env/dynamic/public';

export function load() {
    // ¡NUEVO LOG! Verificamos si la función se ejecuta y qué lee
    console.log('--- Ejecutando load() en +layout.server.js ---');
    const apiUrl = env.PUBLIC_API_URL;
    console.log('PUBLIC_API_URL leída:', apiUrl); // Vemos si tiene valor

    // Si la URL no se lee, devolvemos un error claro
    if (!apiUrl) {
        console.error('¡ERROR FATAL: PUBLIC_API_URL no está definida en el entorno del servidor!');
        // Podríamos lanzar un error aquí, pero por ahora devolvemos null
        // para ver si el resto de la app carga (aunque el login fallará)
        return { apiUrl: null };
     }

    // Devolvemos la URL
    return {
        apiUrl: apiUrl
    };
}