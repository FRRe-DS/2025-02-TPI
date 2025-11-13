import keycloak from '../lib/keycloak';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function agregarProducto(producto: {
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: string;
}) {
  try {
    const token = keycloak.token;
    
    if (!token) {
      throw new Error('No hay token disponible. Por favor inicia sesión nuevamente.');
    }

    const res = await fetch(`${API_URL}/api/v1/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(producto),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en agregarProducto:', error);
    throw error;
  }
}

export async function obtenerProductos() {
  try {
    const token = keycloak.token;
    
    if (!token) {
      throw new Error('No hay token disponible. Por favor inicia sesión nuevamente.');
    }

    const res = await fetch(`${API_URL}/api/v1/productos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    throw error;
  }
}
