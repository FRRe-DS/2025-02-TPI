

// 1. Importamos los servicios
import servicioReservas from '../Servicios/reservasService.js';
const crearReserva = async (req, res) => {
  try {
    const { idCompra, usuarioId, productos } = req.body;

    // 2. VALIDACIÓN (Todo tu código de validación va aquí...)
    if (!idCompra || !usuarioId || !productos /* ...etc */) {
      return res.status(400).json({ mensaje: "Petición incorrecta..." });
    }
    // ...más validaciones...
    if (!Array.isArray(productos) || productos.length === 0) { /* ... */ }
    // ...validación del 'for' de productos...


    // 3. LÓGICA DE NEGOCIO (¡Aquí está el cambio!)
    // Ya no simulamos. Llamamos al servicio con los datos validados.
    const datosValidados = { idCompra, usuarioId, productos };
    
    // 'await' espera a que el servicio termine de hablar con Supabase
    const reservaGuardada = await servicioReservas.crearNuevaReserva(datosValidados);

    // 4. RESPUESTA DE ÉXITO
    // Enviamos la reserva completa que nos devolvió el servicio.
    res.status(201).json(reservaGuardada);

  } catch (error) {
    // 5. MANEJO DE ERRORES
    // Si el 'servicioReservas' lanza un error (throw), este 'catch' lo atrapará.
    console.error('Error en controlador al crear reserva:', error.message);
    
    if(/stock insuficiente/i.test(error.message)) {
      return res.status(400).json({ error: error.message, code: 'STOCK_INSUFICIENTE' });
    }
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};


/**
 * =======================================
 * Controlador para OBTENER UNA reserva por ID
 * (¡ACTUALIZADO!)
 * =======================================
 */
const obtenerReservaPorId = async (req, res) => {
  try {
    // 1. Obtener ID de los parámetros (path)
    const { idReserva } = req.params;

    // 2. ¡NUEVO! Obtener usuarioId del query
    const { usuarioId } = req.query;

    // 3. ¡NUEVO! Validación de autorización
    // (Según 'required: true' en el openapi.yaml)
    if (!usuarioId) {
      return res.status(400).json({ 
        mensaje: "El parámetro 'usuarioId' es obligatorio en la consulta." 
      });
    }

    // 4. Llamar al servicio con AMBOS IDs
    const reserva = await servicioReservas.buscarReservaPorId(
      idReserva, 
      usuarioId
    );

    // 5. Manejar "No Encontrado"
    // Ahora 'null' significa "No encontrado" O "No autorizado"
    if (!reserva) {
      return res.status(404).json({ 
        mensaje: `Reserva con ID ${idReserva} no encontrada o no pertenece al usuario ${usuarioId}.` 
      });
    }

    // 6. Respuesta de Éxito
    res.status(200).json(reserva);

  } catch (error) {
    console.error(`Error al obtener reserva ${req.params.idReserva}:`, error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

/**
 * =======================================
 * Controlador para LISTAR reservas de un usuario
 * =======================================
 * Ruta: GET /reservas
 * * Devuelve un array de 'ReservaCompleta'.
 */
const listarReservas = async (req, res) => {
  try {
    // 1. Obtener filtros y paginación del 'query string'
    const { usuarioId, estado, page, limit } = req.query;

    // 2. Validar parámetros obligatorios (según openapi.yaml)
    if (!usuarioId) {
      return res.status(400).json({ 
        mensaje: "El parámetro 'usuarioId' es obligatorio." 
      });
    }

    // 3. Agrupar filtros y llamar al servicio
    const filtros = {
      // Convertimos a número por si acaso
      usuarioId: parseInt(usuarioId), 
      estado,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    };

    const reservas = await servicioReservas.buscarReservasPorUsuario(filtros);

    // 4. Respuesta de Éxito
    // El servicio ya devuelve el array en el formato 'ReservaCompleta'
    res.status(200).json(reservas);

  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

/**
 * =======================================
 * Controlador para ACTUALIZAR el estado de una reserva
 * =======================================
 * Ruta: PATCH /reservas/{idReserva}
 * * Recibe 'ActualizarReservaInput'.
 * * Devuelve 'ReservaCompleta'.
 */
const actualizarReserva = async (req, res) => {
  try {
    // 1. Obtener ID de los parámetros
    const { idReserva } = req.params;
    
    // 2. Obtener datos del body (según 'ActualizarReservaInput')
    const { usuarioId, estado } = req.body;

    // 3. Validación de entrada
    if (!usuarioId || !estado) {
      return res.status(400).json({ 
        mensaje: "Petición incorrecta. Faltan campos obligatorios: usuarioId o estado." 
      });
    }

    // (Opcional) Validar que el estado sea uno de los permitidos
    const estadosValidos = ['confirmado', 'pendiente', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: `Estado '${estado}' no es válido. Debe ser uno de: ${estadosValidos.join(', ')}.`
      });
    }

    // 4. Llamar al servicio
    const reservaActualizada = await servicioReservas.actualizarEstadoReserva(
      parseInt(idReserva), 
      usuarioId, 
      estado
    );

    // 5. Manejar "No Encontrado"
    // Si el servicio devuelve null, es porque no encontró una reserva
    // con ese ID y ese usuarioId.
    if (!reservaActualizada) {
      return res.status(404).json({ 
        mensaje: `Reserva con ID ${idReserva} no encontrada o no pertenece al usuario.` 
      });
    }

    // 6. Respuesta de Éxito
    // El OpenAPI dice que devolvamos 'ReservaCompleta' en el 200 OK
    res.status(200).json(reservaActualizada);

  } catch (error) {
    console.error(`Error al actualizar reserva ${req.params.idReserva}:`, error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

/**
 * =======================================
 * Controlador para CANCELAR una reserva
 * =======================================
 * Ruta: DELETE /reservas/{idReserva}
 * * Recibe 'CancelacionReservaInput'.
 * * Responde con 204 No Content.
 */
const cancelarReserva = async (req, res) => {
  try {
    // 1. Obtener ID de los parámetros
    const { idReserva } = req.params;

    // 2. Obtener 'motivo' del body (según 'CancelacionReservaInput')
    const { motivo } = req.body;

    // 3. Validación de entrada
    if (!motivo) {
      return res.status(400).json({ 
        mensaje: "Petición incorrecta. El 'motivo' es obligatorio." 
      });
    }
    
    // 4. Llamar al servicio
    const resultado = await servicioReservas.cancelarReservaYLiberarStock(
      parseInt(idReserva),
      motivo
    );

    // 5. Manejar respuestas del servicio
    if (!resultado.success) {
      return res.status(resultado.status).json({ mensaje: resultado.mensaje });
    }

    // 6. Respuesta de Éxito
    // El OpenAPI dice '204 No Content', que no lleva body.
    res.status(204).send();

  } catch (error) {
    console.error(`Error al cancelar reserva ${req.params.idReserva}:`, error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};








// ---- EXPORTS----
export default {
  crearReserva,
  obtenerReservaPorId,
  listarReservas,
  actualizarReserva,
  cancelarReserva
};










