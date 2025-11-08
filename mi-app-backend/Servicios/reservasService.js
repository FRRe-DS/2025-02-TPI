

// Importamos el cliente de Supabase que creamos
import supabase from '../dbConfig.js';


/**
 * ======================================================
 * Servicio para CREAR una nueva reserva
 * ======================================================
 * Intenta usar la función RPC de Supabase para transacción atómica.
 * Si la función no existe, usa el método simplificado.
 * 
 * IMPORTANTE: Ejecuta SQL_MEJORAS.sql en Supabase para crear la función RPC.
 */
const crearNuevaReserva = async (datosReserva) => {
  const { idCompra, usuarioId, productos } = datosReserva;

  // 1. Transformar productos de camelCase a snake_case
  const productosSnakeCase = productos.map(p => ({
    producto_id: p.productoId,
    cantidad: p.cantidad
  }));

  // 2. Intentar usar la función RPC (transacción atómica)
  const { data: dataRPC, error: errorRPC } = await supabase.rpc('crear_reserva_y_descontar_stock', {
    id_compra_in: idCompra,
    usuario_id_in: usuarioId,
    productos_in: productosSnakeCase
  }).single();

  // Si la función RPC existe y funciona, retornar el resultado
  if (!errorRPC && dataRPC) {
    return _mapReservaToOutput(dataRPC);
  }

  // Si la función RPC no existe, usar el método alternativo (menos seguro)
  console.warn('Función RPC no disponible, usando método alternativo (no atómico)');
  
  const { idCompra: idCompraAlt, usuarioId: usuarioIdAlt, productos: productosAlt } = datosReserva;

  // 1. Verificar stock disponible para cada producto
  for (const prod of productos) {
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('id, nombre, stock_disponible')
      .eq('id', prod.productoId)
      .single();

    if (errorProducto || !producto) {
      throw new Error(`Producto con ID ${prod.productoId} no existe.`);
    }

    if (producto.stock_disponible < prod.cantidad) {
      throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock_disponible}, Solicitado: ${prod.cantidad}`);
    }
  }

  // 2. Crear la reserva en la tabla 'reservas'
  const fechaExpiracion = new Date();
  fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 30); // Expira en 30 minutos

  const { data: reserva, error: errorReserva } = await supabase
    .from('reservas')
    .insert({
      id_compra: idCompra,
      usuario_id: usuarioId,
      estado: 'pendiente',
      expires_at: fechaExpiracion.toISOString(),
      fecha_creacion: new Date().toISOString()
    })
    .select()
    .single();

  if (errorReserva) {
    console.error('Error al crear reserva:', errorReserva);
    throw new Error(errorReserva.message);
  }

  // 3. Insertar los productos de la reserva en 'reservas_productos'
  const reservasProductos = productos.map(p => ({
    reserva_id: reserva.id,
    producto_id: p.productoId,
    cantidad: p.cantidad
  }));

  const { error: errorProductos } = await supabase
    .from('reservas_productos')
    .insert(reservasProductos);

  if (errorProductos) {
    console.error('Error al insertar productos de reserva:', errorProductos);
    // Rollback: eliminar la reserva creada
    await supabase.from('reservas').delete().eq('id', reserva.id);
    throw new Error(errorProductos.message);
  }

  // 4. Descontar el stock de cada producto
  // Nota: Esta operación NO es atómica. En producción, usar función RPC de PostgreSQL
  for (const prod of productos) {
    // Obtener stock actual
    const { data: productoActual } = await supabase
      .from('productos')
      .select('stock_disponible')
      .eq('id', prod.productoId)
      .single();

    // Calcular nuevo stock
    const nuevoStock = productoActual.stock_disponible - prod.cantidad;

    // Actualizar stock
    const { error: errorUpdate } = await supabase
      .from('productos')
      .update({ stock_disponible: nuevoStock })
      .eq('id', prod.productoId);

    if (errorUpdate) {
      console.error('Error al actualizar stock:', errorUpdate);
      throw new Error(errorUpdate.message);
    }
  }

  // 5. Devolver la reserva creada
  return _mapReservaToOutput(reserva);
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




/**
 * ======================================================
 * Servicio para RECLAMAR una reserva (Logística)
 * ======================================================
 * Marca una reserva como "reclamada" para entregarla.
 * Cambia el estado a 'en_entrega' o 'reclamada'.
 */
const reclamarReserva = async (idReserva, operadorId, observaciones = '') => {
  // 1. Buscar la reserva
  const { data: reserva, error: errorBusqueda } = await supabase
    .from('reservas')
    .select('id, estado')
    .eq('id', idReserva)
    .single();

  // Manejar error o si no se encuentra
  if (errorBusqueda) {
    if (errorBusqueda.code === 'PGRST116') {
      return { success: false, status: 404, mensaje: "Reserva no encontrada." };
    }
    throw new Error(errorBusqueda.message);
  }

  // 2. Validar estado (solo se puede reclamar si está 'confirmado')
  if (reserva.estado !== 'confirmado') {
    return { 
      success: false, 
      status: 400, 
      mensaje: `No se puede reclamar una reserva con estado '${reserva.estado}'. Debe estar 'confirmado'.` 
    };
  }

  // 3. Actualizar la reserva a estado 'en_entrega'
  // IMPORTANTE: Debes agregar 'en_entrega' al enum estado_reserva en Supabase
  // Ejecuta el archivo SQL_MEJORAS.sql en Supabase para agregar los estados y columnas
  const { data, error: errorUpdate } = await supabase
    .from('reservas')
    .update({
      estado: 'en_entrega',
      operador_logistica_id: operadorId, // Columna opcional
      observaciones_logistica: observaciones, // Columna opcional
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', idReserva)
    .select(`
      id, id_compra, usuario_id, estado, expires_at,
      fecha_creacion, fecha_actualizacion,
      reservas_productos (
        cantidad,
        productos ( id, nombre, precio_unitario )
      )
    `)
    .single();

  if (errorUpdate) {
    console.error('Error al reclamar reserva:', errorUpdate);
    throw new Error(errorUpdate.message);
  }

  // 4. Devolver la reserva completa actualizada
  return { 
    success: true, 
    status: 200, 
    data: _mapReservaCompleta(data),
    meta: {
      operadorId,
      observaciones
    }
  };
};

/**
 * ======================================================
 * Servicio para LISTAR RESERVAS EXPIRADAS (Logística)
 * ======================================================
 * Busca reservas cuyo 'expires_at' es menor a la fecha actual
 * y aún no están canceladas.
 */
const buscarReservasExpiradas = async (filtros = {}) => {
  const { page, limit } = filtros;

  // 1. Construir consulta
  let query = supabase
    .from('reservas')
    .select(`
      id, id_compra, usuario_id, estado, expires_at,
      fecha_creacion, fecha_actualizacion,
      reservas_productos (
        cantidad,
        productos ( id, nombre, precio_unitario )
      )
    `)
    .lt('expires_at', new Date().toISOString()) // expires_at < NOW
    .neq('estado', 'cancelado') // Y que NO estén canceladas
    .neq('estado', 'en_entrega') // Y que NO estén en entrega (ya reclamadas)
    .neq('estado', 'entregado'); // Y que NO estén entregadas

  // 2. Aplicar paginación
  const pageNum = page || 1;
  const pageSize = limit || 20;
  const offset = (pageNum - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  // 3. Ejecutar consulta
  const { data, error } = await query;

  if (error) {
    console.error('Error al buscar reservas expiradas:', error);
    throw new Error(error.message);
  }

  // 4. Mapear y devolver
  return data.map(_mapReservaCompleta);
};

// --------------EXPORTS-------------------
export default {
  crearNuevaReserva,
  buscarReservaPorId,
  buscarReservasPorUsuario,
  actualizarEstadoReserva,
  cancelarReservaYLiberarStock,
  reclamarReserva,
  buscarReservasExpiradas
};