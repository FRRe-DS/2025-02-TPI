// --- archivo: src/servicios/api.js ---

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import keycloak from '../lib/keycloak';

/**
 * NUEVA FUNCIÓN 'WRAPPER' (ENVOLTORIO)
 *
 * Esta función centraliza TODA la lógica de 'fetch'.
 * - Añade la URL base de la API.
 * - Inyecta el token de Keycloak automáticamente.
 * - Maneja las respuestas (JSON) y los errores.
 */
async function fetchConAuth(endpoint, options = {}) {
  const token = (typeof window !== 'undefined' && keycloak.token) 
    ? keycloak.token 
    : null;

  // 1. Preparar Headers
  const headers = new Headers(options.headers || {});
  
  if (options.method === 'POST' || options.method === 'PATCH' || options.method === 'DELETE') {
    if (!headers.has('Content-Type') && options.body) {
      headers.append('Content-Type', 'application/json');
    }
  }
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // 2. Preparar Opciones finales
  const fetchOptions = {
    ...options,
    headers: headers
  };

  // 3. Construir URL completa
  const url = `${API_URL}${endpoint}`;
  
  console.log(`Llamando a (con auth): ${options.method || 'GET'} ${endpoint}`);
  
  // 4. Ejecutar el fetch
  const res = await fetch(url, fetchOptions);

  // 5. Manejo de Errores
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { mensaje: res.statusText || 'Error de red' };
    }
    
    const errorMessage = errorData.mensaje || `Error ${res.status}`;
    
    if (res.status === 401 && token) {
      console.warn('Token expirado (401), intentando refrescar...');
      keycloak?.updateToken(30).catch(() => keycloak.logout());
    }
    
    throw new Error(errorMessage);
  }

  // 6. Manejar respuestas sin contenido (ej. DELETE exitoso - 204 No Content)
  if (res.status === 204) {
    return; 
  }
  
  // 7. Devolver el JSON
  return res.json();
}


// --- PRODUCTOS ---

export async function obtenerProductos(filtros = {}) { 
  const { page = 1, limit = 10, q, categoriaId } = filtros;
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (q) params.append('q', q);
  if (categoriaId && categoriaId > 0) params.append('categoriaId', categoriaId.toString());
  
  return fetchConAuth(`/productos?${params.toString()}`);
}

export async function obtenerProductoPorId(id) {
  return fetchConAuth(`/productos/${id}`);
}

export async function agregarProducto(productoData) { 
  return fetchConAuth(`/productos`, {
    method: 'POST',
    body: JSON.stringify(productoData)
  });
}

export async function actualizarProducto(productoId, datosActualizados) {
  return fetchConAuth(`/productos/${productoId}`, {
    method: 'PATCH',
    body: JSON.stringify(datosActualizados) 
  });
}

export async function eliminarProducto(productoId) {
  return fetchConAuth(`/productos/${productoId}`, {
    method: 'DELETE'
  });
}

// --- CATEGORÍAS ---

export async function obtenerCategorias() {
  return fetchConAuth(`/categorias`);
}

export async function crearCategoria(categoriaData) {
  return fetchConAuth(`/categorias`, {
    method: 'POST',
    body: JSON.stringify(categoriaData)
  });
}

export async function actualizarCategoria(id, categoriaData) {
  return fetchConAuth(`/categorias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoriaData)
  });
}

export async function eliminarCategoria(id) {
  return fetchConAuth(`/categorias/${id}`, {
    method: 'DELETE'
  });
}

// --- RESERVAS ---

export async function crearReserva(reservaData) {
  return fetchConAuth(`/reservas`, {
    method: 'POST',
    body: JSON.stringify(reservaData)
  });
}

export async function obtenerReservas(filtros = {}) {
  const { usuarioId, estado = '', page = 1, limit = 5 } = filtros;
  if (!usuarioId) {
    throw new Error('usuarioId es requerido para obtener reservas.');
  }
  const params = new URLSearchParams();
  params.append('usuarioId', usuarioId.toString());
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (estado) params.append('estado', estado);

  return fetchConAuth(`/reservas?${params.toString()}`); 
}

export async function actualizarReserva(reservaId, usuarioId, nuevoEstado) {
  return fetchConAuth(`/reservas/${reservaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      usuarioId: usuarioId, 
      estado: nuevoEstado 
    }) 
  });
}

export async function cancelarReserva(reservaId, motivo) {
  return fetchConAuth(`/reservas/${reservaId}`, {
    method: 'DELETE',
    body: JSON.stringify({ motivo: motivo }) 
  });
}