// --- archivo: src/servicios/api.js ---

// 1. Define la URL de tu backend
// (Asegúrate de tener NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 en tu .env.local)
const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API_URL (archivo api.js):', API_URL);

// --- PRODUCTOS ---

/**
 * Obtiene la lista de productos (paginada Y FILTRADA)
 * Acepta un objeto de filtros.
 */
export async function obtenerProductos(filtros = {}) { 
  // 1. Definimos los valores por defecto
  const { 
    page = 1, 
    limit = 10, 
    q, // Para búsqueda por texto
    categoriaId  // Para filtrar por categoría
  } = filtros;

  // 2. Construimos la cadena de consulta (query string)
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (q) {
    params.append('q', q); // Añade ?q=laptop
  }
  if (categoriaId && categoriaId > 0) { // Añade &categoriaId=1
    params.append('categoriaId', categoriaId.toString());
  }

  const queryString = params.toString();
  console.log(`Llamando a: GET /productos?${queryString}`);
  
  // 3. Hacemos el fetch con la consulta completa
  const res = await fetch(`${API_URL}/productos?${queryString}`); 
  
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

/**
 * Obtiene un producto específico por su ID
 */
export async function obtenerProductoPorId(id) {
  console.log(`Llamando a: GET /productos/${id}`);
  const res = await fetch(`${API_URL}/productos/${id}`);
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }
    throw new Error('Error al buscar el producto');
  }
  return res.json();
}

/**
 * Crea un nuevo producto
 */
export async function agregarProducto(productoData) { 
  console.log('Llamando a: POST /productos');
  const res = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productoData)
  });
  if (!res.ok) {
     const errorData = await res.json().catch(() => ({})); 
     throw new Error(errorData.mensaje || 'Error al agregar el producto');
  }
  return res.json();
}

/**
 * Actualiza un producto existente
 */
export async function actualizarProducto(productoId, datosActualizados) {
  console.log(`Llamando a: PATCH /productos/${productoId}`);
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados) 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al actualizar el producto');
  }
  return res.json(); 
}

/**
 * Elimina un producto
 */
export async function eliminarProducto(productoId) {
  console.log(`Llamando a: DELETE /productos/${productoId}`);
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.mensaje || 'Error al eliminar el producto');
  }
  return res; 
}

// --- CATEGORÍAS ---

/**
 * Obtiene todas las categorías
 */
export async function obtenerCategorias() {
  console.log('Llamando a: GET /categorias');
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
}

/**
 * Crea una nueva categoría
 */
export async function crearCategoria(categoriaData) {
  console.log('Llamando a: POST /categorias');
  const res = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoriaData)
  });
  if (!res.ok) throw new Error('Error al crear la categoría');
  return res.json();
}

/**
 * Actualiza una categoría existente
 */
export async function actualizarCategoria(id, categoriaData) {
  console.log(`Llamando a: PATCH /categorias/${id}`);
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoriaData)
  });
  if (!res.ok) throw new Error('Error al actualizar la categoría');
  return res.json();
}

/**
 * Elimina una categoría
 */
export async function eliminarCategoria(id) {
  console.log(`Llamando a: DELETE /categorias/${id}`);
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.mensaje || 'Error al eliminar la categoría');
  }
  return res;
}

// --- RESERVAS ---

/**
 * Crea una nueva reserva
 */
export async function crearReserva(reservaData) {
  console.log('Llamando a: POST /reservas');
  const res = await fetch(`${API_URL}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservaData)
  });
  if (!res.ok) {
     const errorData = await res.json().catch(() => ({})); 
     throw new Error(errorData.mensaje || 'Error al crear la reserva');
  }
  return res.json();
}

/**
 * Obtiene las reservas (ACTUALIZADO CON FILTROS Y PAGINACIÓN)
 */
export async function obtenerReservas(filtros = {}) {
  const {
    usuarioId,
    estado = '', // '' = Todos
    page = 1,
    limit = 5 // Límite más bajo para reservas
  } = filtros;

  // El ID de usuario es obligatorio para esta consulta
  if (!usuarioId) {
    throw new Error('usuarioId es requerido para obtener reservas.');
  }

  // Construimos la cadena de consulta
  const params = new URLSearchParams();
  params.append('usuarioId', usuarioId.toString());
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  // Solo añadimos el estado si no está vacío
  if (estado) {
    params.append('estado', estado);
  }

  const queryString = params.toString();
  console.log(`Llamando a: GET /reservas?${queryString}`);
  
  const res = await fetch(`${API_URL}/reservas?${queryString}`); 
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
}

/**
 * ¡NUEVO! Actualiza el estado de una reserva
 */
export async function actualizarReserva(reservaId, usuarioId, nuevoEstado) {
  console.log(`Llamando a: PATCH /reservas/${reservaId}`);
  
  const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    // El body debe coincidir con 'ActualizarReservaInput' del backend
    body: JSON.stringify({ 
      usuarioId: usuarioId, 
      estado: nuevoEstado 
    }) 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.mensaje || 'Error al actualizar la reserva');
  }
  
  // Devuelve la 'ReservaCompleta' actualizada
  return res.json(); 
}


/**
 * Cancela una reserva existente
 */
export async function cancelarReserva(reservaId, motivo) {
  console.log(`Llamando a: DELETE /reservas/${reservaId}`);
  const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo: motivo }) 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.mensaje || 'Error al cancelar la reserva');
  }
  return; 
}