const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API_URL:', API_URL);
import keycloak from '../lib/keycloak';

export async function agregarProducto(producto) {
  const token = keycloak.token;
  const res = await fetch(`${API_URL}/api/v1/productos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(producto)
  });
  if (!res.ok) throw new Error('Error al agregar producto');
  return await res.json();
}

export async function obtenerProductos() {
  const token = keycloak.token;
  const res = await fetch(`${API_URL}/api/v1/productos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
}
