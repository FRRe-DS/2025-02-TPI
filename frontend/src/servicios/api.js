
const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API_URL:', API_URL);



export async function obtenerProductos() { 
  
  console.log('Llamando a la API de productos (sin autenticación)...');

  // Llama a tu backend
 const res = await fetch(`${API_URL}/productos`);
  
 if (!res.ok) {
    // Si esto falla, es un error 500 del backend o la URL está mal
  throw new Error('Error al obtener productos');
  }
  return res.json();
}


export async function agregarProducto(productoData) { 
  console.log('Llamando a: POST /productos');
  const res = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productoData)
  });
  if (!res.ok) throw new Error('Error al agregar el producto');
  return res.json();
}

// ¡NUEVO! Para un botón de "Borrar"
export async function eliminarProducto(productoId) {
  console.log(`Llamando a: DELETE /productos/${productoId}`);
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'DELETE'
  });
  // DELETE responde con 204 No Content, así que no hay JSON
  if (!res.ok) throw new Error('Error al eliminar el producto');
  return res; 
}
// ¡NUEVO! Para el botón de "Editar"
export async function actualizarProducto(productoId, datosActualizados) {
  console.log(`Llamando a: PATCH /productos/${productoId}`);
  
  const res = await fetch(`${API_URL}/productos/${productoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    // Enviamos solo los campos que queremos cambiar
    body: JSON.stringify(datosActualizados) 
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al actualizar el producto');
  }
  
  // Devuelve el producto completo y actualizado
  return res.json(); 
}

// --- CATEGORÍAS ---

// ¡NUEVO! Para llenar un <select> en tu formulario de productos
export async function obtenerCategorias() {
  console.log('Llamando a: GET /categorias');
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
}

// --- RESERVAS ---

// ¡NUEVO! Para un botón de "Reservar" o "Checkout"
export async function crearReserva(reservaData) {
  console.log('Llamando a: POST /reservas');
  const res = await fetch(`${API_URL}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservaData)
  });
  if (!res.ok) throw new Error('Error al crear la reserva');
  return res.json();
}

// ¡NUEVO! Para una página de "Mis Reservas"
export async function obtenerReservas(usuarioId) {
  console.log(`Llamando a: GET /reservas?usuarioId=${usuarioId}`);
  // El usuarioId ahora es "falso" (solo para pruebas)
  const res = await fetch(`${API_URL}/reservas?usuarioId=${usuarioId}`); 
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
}

export async function cancelarReserva(reservaId, motivo) {
  console.log(`Llamando a: DELETE /reservas/${reservaId}`);
  const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
    method: 'DELETE',
    // ¡Importante! Este DELETE lleva un body
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo: motivo }) 
  });
  
  // DELETE responde con 204 No Content, pero si falla (404, 500)
  // queremos saber por qué.
  if (!res.ok) {
    // Intentamos leer el JSON de error si existe
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.mensaje || 'Error al cancelar la reserva');
  }
  
  // Si res.ok es true, no hay cuerpo, simplemente retornamos
  return; 
}