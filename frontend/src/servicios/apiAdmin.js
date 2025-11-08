// ============================================
// API SERVICE - PORTAL DE ADMINISTRACIÓN
// ============================================
// Endpoints para gestión interna (Grupo 2 - Vendedores)
// Requiere rol: stock-be

import keycloak from '../lib/keycloak';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin`;

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
  
  console.log(`[Admin] ${options.method || 'GET'} ${endpoint}`);
  
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
// PRODUCTOS (CRUD completo)
// =============================

/**
 * Lista todos los productos (con paginación y filtros)
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
 * Obtiene el detalle de un producto
 */
export async function obtenerProductoPorId(id) {
  return fetchConAuth(`/productos/${id}`);
}

/**
 * Crea un nuevo producto
 * @param {Object} productoData - Datos del producto
 */
export async function agregarProducto(productoData) { 
  return fetchConAuth(`/productos`, {
    method: 'POST',
    body: JSON.stringify(productoData)
  });
}

/**
 * Actualiza un producto existente
 * @param {number} productoId - ID del producto
 * @param {Object} datosActualizados - Campos a actualizar
 */
export async function actualizarProducto(productoId, datosActualizados) {
  return fetchConAuth(`/productos/${productoId}`, {
    method: 'PATCH',
    body: JSON.stringify(datosActualizados) 
  });
}

/**
 * Elimina un producto
 * @param {number} productoId - ID del producto
 */
export async function eliminarProducto(productoId) {
  return fetchConAuth(`/productos/${productoId}`, {
    method: 'DELETE'
  });
}

// =============================
// CATEGORÍAS (CRUD completo)
// =============================

/**
 * Lista todas las categorías
 */
export async function obtenerCategorias() {
  return fetchConAuth(`/categorias`);
}

/**
 * Obtiene el detalle de una categoría
 */
export async function obtenerCategoriaPorId(id) {
  return fetchConAuth(`/categorias/${id}`);
}

/**
 * Crea una nueva categoría
 * @param {Object} categoriaData - { nombre, descripcion }
 */
export async function crearCategoria(categoriaData) {
  return fetchConAuth(`/categorias`, {
    method: 'POST',
    body: JSON.stringify(categoriaData)
  });
}

/**
 * Actualiza una categoría existente
 * @param {number} id - ID de la categoría
 * @param {Object} categoriaData - Campos a actualizar
 */
export async function actualizarCategoria(id, categoriaData) {
  return fetchConAuth(`/categorias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoriaData)
  });
}

/**
 * Elimina una categoría
 * @param {number} id - ID de la categoría
 */
export async function eliminarCategoria(id) {
  return fetchConAuth(`/categorias/${id}`, {
    method: 'DELETE'
  });
}
