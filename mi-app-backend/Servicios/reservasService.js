

// Importamos el cliente de Supabase que creamos
import supabase from '../dbConfig.js';
import productosService from './productosService.js';

/**
 * ======================================================
 * Servicio para CREAR una nueva reserva (¡ACTUALIZADO!)
 * ======================================================
 * Llama a la función RPC 'crear_reserva_y_descontar_stock'
 * para ejecutar la transacción en la base de datos.
 */
const crearNuevaReserva = async (datosReserva) => {
  const { idCompra, usuarioId, productos } = datosReserva;

  // 1. Llamar a la función RPC
  // El nombre debe coincidir EXACTAMENTE con el del SQL
  const { data, error } = await supabase.rpc('crear_reserva_y_descontar_stock', {
    id_compra_in: idCompra,
    usuario_id_in: usuarioId,
    productos_in: productos // Pasamos el array de productos directamente
  })
  .single(); // Esperamos que la función devuelva una sola fila (la nueva reserva)

  // 2. Manejar errores
  if (error) {
    const esErrorDeStock = /stock insuficiente/i.test(error.message);
    if (esErrorDeStock) {
      console.log('Error de stock detectado al crear reserva:');
      
      const match = error.message.match(/Producto ID: (\d+)/i);
      if (match) {
        const productoIdSinStock = parseInt(match[1], 10);
        const productoPedido = productos.find(p => p.idProducto === productoIdSinStock);
        const productoActual = await productosService.buscarProductoPorId(productoIdSinStock);
        
        if (productoPedido && productoActual) {
          comprasService.notificarFaltaDeStock(
            productoIdSinStock,
            productoPedido.cantidad,
            productoActual.stockDisponible
          );
        }
      }  
  }
  throw new Error(error.message);
}
  // 3. Devolver la reserva en el formato 'ReservaOutput'
  // La RPC devuelve la fila de la BD, la mapeamos al formato de la API
  return _mapReservaToOutput(data);
};




//Funcion para traducir de Camel a Snake
const _mapReservaToOutput = (data) => {
  // Si no hay datos, devuelve null
  if (!data) return null;

  // Transforma de snake_case (BD) a camelCase (API)
  return {
    idReserva: data.id, // Asumiendo que la PK en Supabase es 'id'
    idCompra: data.id_compra,
    usuarioId: data.usuario_id,
    estado: data.estado,
    expiresAt: data.expires_at,       // Asumiendo columna 'expires_at'
    fechaCreacion: data.fecha_creacion // Asumiendo columna 'fecha_creacion'
  };
};



/**
 * ======================================================
 * HELPER: Mapea datos de la BD a 'ReservaCompleta' (NUEVO)
 * ======================================================
 * Transforma la respuesta anidada de Supabase al
 * formato plano que espera la API (ReservaCompleta).
 */
const _mapReservaCompleta = (data) => {
  if (!data) return null;

  // Mapeamos el array de productos anidados
  const productosMapeados = data.reservas_productos.map(item => {
    // 'item' es de la tabla 'reservas_productos'
    // 'item.productos' es el JOIN con la tabla 'productos'
    return {
      idProducto: item.productos.id,
      nombre: item.productos.nombre,
      cantidad: item.cantidad, // La cantidad viene de 'reservas_productos'
      precioUnitario: item.productos.precio_unitario
    };
  });

  // Mapeamos la reserva principal
  return {
    idReserva: data.id,
    idCompra: data.id_compra,
    usuarioId: data.usuario_id,
    estado: data.estado,
    expiresAt: data.expires_at,
    fechaCreacion: data.fecha_creacion,
    fechaActualizacion: data.fecha_actualizacion, // El nuevo campo
    productos: productosMapeados // El nuevo array de productos
  };
};

/**
 * ======================================================
 * Servicio para BUSCAR UNA reserva por ID (ACTUALIZADO)
 * ======================================================
 * Ahora usa un JOIN para traer los detalles de los productos.
 */
const buscarReservaPorId = async (id) => {
  // 1. Consultar a Supabase con JOIN
  // Esta sintaxis de 'select' anidado es cómo Supabase hace JOINs.
  // ¡Requiere que tengas las Foreign Keys configuradas en Supabase!
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id,
      id_compra,
      usuario_id,
      estado,
      expires_at,
      fecha_creacion,
      fecha_actualizacion,
      reservas_productos (
        cantidad,
        productos (
          id,
          nombre,
          precio_unitario
        )
      )
    `)
    .eq('id', id)
    .single();

  // 2. Manejar error de Supabase
  if (error && error.code !== 'PGRST116') { // Ignora 'No rows found'
    console.error('Error en Supabase al buscar reserva completa:', error);
    throw new Error(error.message);
  }

  // 3. Mapear y devolver
  // Usamos el nuevo helper para transformar la data
  return _mapReservaCompleta(data);
};

/**
 * ======================================================
 * Servicio para BUSCAR TODAS las reservas de un usuario
 * ======================================================
 * Incluye filtros y paginación.
 */
const buscarReservasPorUsuario = async (filtros) => {
  const { usuarioId, estado, page, limit } = filtros;

  // 1. Construir la consulta de Supabase
  // Empezamos con la misma consulta de JOIN que antes
  let query = supabase
    .from('reservas')
    .select(`
      id, id_compra, usuario_id, estado, expires_at,
      fecha_creacion, fecha_actualizacion,
      reservas_productos (
        cantidad,
        productos ( id, nombre, precio_unitario )
      )
    `);
  
  // 2. Aplicar Filtros Obligatorios
  query = query.eq('usuario_id', usuarioId);

  // 3. Aplicar Filtros Opcionales
  if (estado) {
    query = query.eq('estado', estado);
  }

  // 4. Aplicar Paginación
  // (Asumiendo valores por defecto si no se proveen)
  const pageNum = page || 1;
  const pageSize = limit || 10;
  const offset = (pageNum - 1) * pageSize;
  
  query = query.range(offset, offset + pageSize - 1);

  // 5. Ejecutar la consulta
  const { data, error } = await query;

  // 6. Manejar error
  if (error) {
    console.error('Error en Supabase al listar reservas:', error);
    throw new Error(error.message);
  }

  // 7. Mapear CADA resultado
  // 'data' es un array. Usamos .map() para transformar
  // cada objeto del array usando el helper que ya teníamos.
  return data.map(_mapReservaCompleta);
};

/**
 * ======================================================
 * Servicio para ACTUALIZAR EL ESTADO de una reserva
 * ======================================================
 */
const actualizarEstadoReserva = async (idReserva, usuarioId, nuevoEstado) => {
  // 1. Intentar actualizar la reserva
  const { data, error } = await supabase
    .from('reservas')
    .update({ 
      estado: nuevoEstado,
      fecha_actualizacion: new Date().toISOString() // Actualizamos la fecha
    })
    .eq('id', idReserva)       // Donde el ID de reserva coincida
    .eq('usuario_id', usuarioId) // Y donde el ID de usuario también coincida
    .select('id') // Seleccionamos solo el 'id' para saber si se actualizó algo
    .single();

  // 2. Manejar error de Supabase
  if (error) {
    console.error('Error en Supabase al actualizar reserva:', error);
    throw new Error(error.message);
  }

  // 3. Verificar si se actualizó algo
  // Si 'data' es null, significa que la consulta .eq() no encontró
  // ninguna fila que coincida (o la reserva no existe o no es de ese usuario).
  if (!data) {
    return null; // El controlador interpretará esto como un 404
  }

  // 4. Si se actualizó, buscar y devolver la reserva completa
  // Reutilizamos la función que ya teníamos para devolver
  // el objeto 'ReservaCompleta' como pide el OpenAPI.
  return await buscarReservaPorId(idReserva);
};



/**
 * ======================================================
 * Servicio para CANCELAR una reserva Y LIBERAR STOCK
 * ======================================================
 * ¡Esta es una operación crítica de negocio!
 */
const cancelarReservaYLiberarStock = async (idReserva, motivo) => {

  // --- PASO 1: Buscar la reserva y sus productos ---
  // Necesitamos saber qué productos y qué cantidades liberar
  const { data: reserva, error: errorBusqueda } = await supabase
    .from('reservas')
    .select(`
      id,
      estado,
      reservas_productos (
        producto_id,
        cantidad
      )
    `)
    .eq('id', idReserva)
    .single();

  // Manejar error o si no se encuentra
  if (errorBusqueda) {
    console.error('Error al buscar reserva para cancelar:', errorBusqueda);
    // Si 'data' es null (PGRST116), significa 404
    if (errorBusqueda.code === 'PGRST116') {
      return { success: false, status: 404, mensaje: "Reserva no encontrada." };
    }
    throw new Error(errorBusqueda.message);
  }

  // Verificar si ya está cancelada
  if (reserva.estado === 'cancelado') {
    return { success: false, status: 400, mensaje: "La reserva ya fue cancelada." };
  }
  
  const productosARelevar = reserva.reservas_productos;

  // --- PASO 2: Liberar el stock (incrementar) ---
  // Por cada producto en la reserva, ejecutamos una función RPC
  // que incrementa el stock de forma atómica.
  // (Esto asume que creaste una función 'incrementar_stock' en tu BD de Supabase)
  
  if (productosARelevar && productosARelevar.length > 0) {
    // Creamos un array de promesas
    const promesasStock = productosARelevar.map(item =>
      supabase.rpc('incrementar_stock', {
        id_producto_in: item.producto_id,
        cantidad_in: item.cantidad
      })
    );
    
    // Ejecutamos todas las promesas en paralelo
    const resultados = await Promise.all(promesasStock);

    // Revisar si alguna falló (esto es una simplificación)
    for (const res of resultados) {
      if (res.error) {
        console.error('¡FALLO CRÍTICO! Error al liberar stock:', res.error);
        throw new Error(`Error al liberar stock para producto ${res.producto_id}: ${res.error.message}`);
        // ¡Aquí es donde una transacción real de BD salvaría el día!
      }
    }
  }

  // --- PASO 3: Actualizar el estado de la reserva ---
  const { error: errorUpdate } = await supabase
    .from('reservas')
    .update({
      estado: 'cancelado',
      motivo_cancelacion: motivo, // Asumiendo que tienes una columna para esto
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', idReserva);

  if (errorUpdate) {
    console.error('Error al actualizar estado de reserva a cancelado:', errorUpdate);
    throw new Error(errorUpdate.message);
  }

  // Si todo salió bien
  return { success: true, status: 204 };
};




// --------------EXPORTS-------------------
export default {
  crearNuevaReserva,
  buscarReservaPorId,
  buscarReservasPorUsuario,
  actualizarEstadoReserva,
  cancelarReservaYLiberarStock
};