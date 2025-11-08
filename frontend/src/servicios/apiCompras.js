// ============================================
// API SERVICE - PORTAL DE COMPRAS
// ============================================
// Endpoints para el Portal de Compras (Grupo 1)
// Requiere rol: compras-be

import keycloak from '../lib/keycloak';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/compras`;

/**
 * Función helper para hacer fetch con autenticación
 */
async function fetchConAuth(endpoint, options = {}) {
  const token = (typeof window !== 'undefined' && keycloak.token) 
    ? keycloak.token 
    : null;

  const headers = new Headers(options.headers || {});
  
  if (options.method === 'POST' || options.method === 'PATCH') {
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
  }
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const fetchOptions = { ...options, headers };
  const url = `${API_URL}${endpoint}`;
  
  console.log(`[Compras] ${options.method || 'GET'} ${endpoint}`);
  
  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    const errorMessage = errorData.mensaje || `Error ${res.status}`;
    
    if (res.status === 401 && token) {
      console.warn('Token expirado, intentando refrescar...');
      keycloak.updateToken(30).catch(() => keycloak.logout());
    }
    
    throw new Error(errorMessage);
  }

  if (res.status === 204) return;
  
  return res.json();
}

// =============================
// PRODUCTOS (Solo lectura)
// =============================

/**
 * Lista todos los productos disponibles para comprar
 */
export async function obtenerProductos(filtros = {}) { 
  const { page = 1, limit = 10, q, categoriaId } = filtros;
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (q) params.append('q', q);
  if (categoriaId && categoriaId > 0) params.append('categoriaId', categoriaId.toString());
  
  return fetchConAuth(`/productos?${params.toString()}`);
}

/**
 * Obtiene el detalle de un producto específico
 */
export async function obtenerProductoPorId(id) {
  return fetchConAuth(`/productos/${id}`);
}

// =============================
// CATEGORÍAS (Solo lectura)
// =============================

/**
 * Lista todas las categorías disponibles
 */
export async function obtenerCategorias() {
  return fetchConAuth(`/categorias`);
}

// =============================
// RESERVAS (CRUD completo)
// =============================

/**
 * Crea una nueva reserva
 * @param {Object} reservaData - { idCompra, usuarioId, productos: [{productoId, cantidad}] }
 */
export async function crearReserva(reservaData) {
  return fetchConAuth(`/reservas`, {
    method: 'POST',
    body: JSON.stringify(reservaData)
  });
}

/**
 * Obtiene todas las reservas de un usuario
 * @param {Object} filtros - { usuarioId, estado, page, limit }
 */
export async function obtenerReservas(filtros = {}) {
  const { usuarioId, estado = '', page = 1, limit = 10 } = filtros;

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

/**
 * Obtiene el detalle de una reserva específica
 * @param {number} reservaId - ID de la reserva
 * @param {number} usuarioId - ID del usuario (para verificar permisos)
 */
export async function obtenerReservaPorId(reservaId, usuarioId) {
  return fetchConAuth(`/reservas/${reservaId}?usuarioId=${usuarioId}`);
}

/**
 * Actualiza el estado de una reserva
 * @param {number} reservaId - ID de la reserva
 * @param {number} usuarioId - ID del usuario
 * @param {string} nuevoEstado - 'pendiente' | 'confirmado' | 'cancelado'
 */
export async function actualizarReserva(reservaId, usuarioId, nuevoEstado) {
  return fetchConAuth(`/reservas/${reservaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      usuarioId: usuarioId, 
      estado: nuevoEstado 
    }) 
  });
}

/**
 * Cancela una reserva y libera el stock
 * @param {number} reservaId - ID de la reserva
 * @param {string} motivo - Motivo de cancelación
 */
export async function cancelarReserva(reservaId, motivo) {
  return fetchConAuth(`/reservas/${reservaId}`, {
    method: 'DELETE',
    body: JSON.stringify({ motivo: motivo }) 
  });
}
