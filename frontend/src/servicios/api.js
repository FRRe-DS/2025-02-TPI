// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
console.log('API_URL:', API_URL);

import keycloak from '../lib/keycloak'; // tu instancia de keycloak

/**
 * Obtener lista de productos (catálogo público)
 * Usa la ruta pública de compras
 */
export async function obtenerProductos() {
  const token = keycloak.token;
  
  // Usar la ruta de compras (pública o protegida según tu config)
  const res = await fetch(`${API_URL}/api/compras/productos`, {
    headers: token ? {
      Authorization: `Bearer ${token}`,
    } : {},
  });
  
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
}

/**
 * Agregar un nuevo producto (para vendedores)
 * Usa la ruta de stock (protegida)
 */
export async function agregarProducto(producto) {
  const token = keycloak.token;
  
  // Usar la ruta de stock para vendedores
  const res = await fetch(`${API_URL}/api/stock/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(producto)
  });
  
  if (!res.ok) throw new Error('Error al agregar producto');
  return await res.json();
}
