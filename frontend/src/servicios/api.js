// --- archivo: src/servicios/api.js ---

const API_URL = process.env.NEXT_PUBLIC_API_URL;
import keycloak from '../lib/keycloak';

/**
 * Función helper para hacer peticiones a la API
 * CON autenticación de Keycloak
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const token = (typeof window !== 'undefined' && keycloak.token) 
    ? keycloak.token 
    : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Agregar token de autorización si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers
  };

  console.log(`Llamando a: ${options.method || 'GET'} ${endpoint}`);
  
  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { mensaje: res.statusText || 'Error de red' };
    }
    
    const errorMessage = errorData.mensaje || `Error ${res.status}`;
    
    // Si es 401 y tenemos token, intentar refrescar
    if (res.status === 401 && token) {
      console.warn('Token expirado (401), intentando refrescar...');
      keycloak?.updateToken(30).catch(() => keycloak.logout());
    }
    
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return; 
  }
  
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
  
  return apiFetch(`/api/v1/productos?${params.toString()}`);
}

export async function obtenerProductoPorId(id) {
  return apiFetch(`/api/v1/productos/${id}`);
}

export async function agregarProducto(productoData) { 
  return apiFetch(`/api/v1/productos`, {
    method: 'POST',
    body: JSON.stringify(productoData)
  });
}

export async function actualizarProducto(productoId, datosActualizados) {
  return apiFetch(`/api/v1/productos/${productoId}`, {
    method: 'PATCH',
    body: JSON.stringify(datosActualizados) 
  });
}

export async function eliminarProducto(productoId) {
  return apiFetch(`/api/v1/productos/${productoId}`, {
    method: 'DELETE'
  });
}

// --- CATEGORÍAS ---

export async function obtenerCategorias() {
  return apiFetch(`/api/v1/categorias`);
}

export async function crearCategoria(categoriaData) {
  return apiFetch(`/api/v1/categorias`, {
    method: 'POST',
    body: JSON.stringify(categoriaData)
  });
}

export async function actualizarCategoria(id, categoriaData) {
  return apiFetch(`/api/v1/categorias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoriaData)
  });
}

export async function eliminarCategoria(id) {
  return apiFetch(`/api/v1/categorias/${id}`, {
    method: 'DELETE'
  });
}

// --- RESERVAS ---

export async function crearReserva(reservaData) {
  return apiFetch(`/api/v1/reservas`, {
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

  return apiFetch(`/api/v1/reservas?${params.toString()}`); 
}

export async function actualizarReserva(reservaId, usuarioId, nuevoEstado) {
  return apiFetch(`/api/v1/reservas/${reservaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      usuarioId: usuarioId, 
      estado: nuevoEstado 
    }) 
  });
}

export async function cancelarReserva(reservaId, motivo) {
  return apiFetch(`/api/v1/reservas/${reservaId}`, {
    method: 'DELETE',
    body: JSON.stringify({ motivo: motivo }) 
  });
}