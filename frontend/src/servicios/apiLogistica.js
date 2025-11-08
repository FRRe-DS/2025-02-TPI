// ============================================
// API SERVICE - PORTAL DE LOGÍSTICA
// ============================================
// Endpoints para el Portal de Logística (Grupo 3)
// Requiere rol: logistica-be

import keycloak from '../lib/keycloak';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/logistica`;

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
  
  console.log(`[Logística] ${options.method || 'GET'} ${endpoint}`);
  
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
// PRODUCTOS (Con datos completos para envío)
// =============================

/**
 * Obtiene el detalle COMPLETO de un producto
 * Incluye: peso, dimensiones, ubicación del almacén
 * @param {number} productoId - ID del producto
 */
export async function obtenerProductoDetallado(productoId) {
  return fetchConAuth(`/productos/${productoId}`);
}

// =============================
// RESERVAS (Gestión de entregas)
// =============================

/**
 * Obtiene el detalle de una reserva
 * @param {number} reservaId - ID de la reserva
 */
export async function obtenerReservaPorId(reservaId) {
  return fetchConAuth(`/reservas/${reservaId}`);
}

/**
 * Lista todas las reservas expiradas que necesitan liberar stock
 * @param {Object} filtros - { page, limit }
 */
export async function obtenerReservasExpiradas(filtros = {}) {
  const { page = 1, limit = 20 } = filtros;
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return fetchConAuth(`/reservas/expiradas?${params.toString()}`);
}

/**
 * Reclama una reserva para entregarla
 * Cambia el estado a 'en_entrega'
 * @param {number} reservaId - ID de la reserva
 * @param {string} operadorId - ID del operador de logística
 * @param {string} observaciones - Observaciones opcionales
 */
export async function reclamarReserva(reservaId, operadorId, observaciones = '') {
  return fetchConAuth(`/reservas/${reservaId}/reclamar`, {
    method: 'POST',
    body: JSON.stringify({ 
      operadorId, 
      observaciones 
    })
  });
}

/**
 * Libera el stock de una reserva expirada
 * Cambia el estado a 'cancelado' y devuelve stock
 * @param {number} reservaId - ID de la reserva
 * @param {string} motivo - Motivo de liberación
 */
export async function liberarReserva(reservaId, motivo) {
  return fetchConAuth(`/reservas/${reservaId}/liberar`, {
    method: 'POST',
    body: JSON.stringify({ motivo })
  });
}
