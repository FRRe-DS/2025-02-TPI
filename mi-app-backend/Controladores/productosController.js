

import productosServicio from '../Servicios/productosService.js';

/**
 * =======================================
 * Controlador para LISTAR productos
 * =======================================
 * Ruta: GET /productos
 * * Devuelve un array de 'Producto'.
 */
const listarProductos = async (req, res) => {
  try {
    // 1. Obtener filtros y paginación del 'query string'
    const { page, limit, q, categoriaId } = req.query;

    // 2. Agrupar filtros y llamar al servicio
    const filtros = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      q,
      categoriaId: categoriaId ? parseInt(categoriaId) : undefined
    };

    const productos = await productosServicio.listarProductos(filtros);

    // 3. Respuesta de Éxito
    res.status(200).json(productos);

  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};




/**
 * =======================================
 * Controlador para OBTENER UN producto por ID
 * =======================================
 * Ruta: GET /productos/{productoId}
 * * Devuelve un objeto 'Producto'.
 */
const obtenerProductoPorId = async (req, res) => {
  try {
    // 1. Obtener el ID de los parámetros
    // La ruta debe usar :productoId para que esto coincida
    const { productoId } = req.params;

    // 2. Llamar al servicio
    const producto = await productosServicio.buscarProductoPorId(productoId);

    // 3. Manejar "No Encontrado" (Not Found)
    if (!producto) {
      return res.status(404).json({ 
        mensaje: `Producto con ID ${productoId} no encontrado.` 
      });
    }

    // 4. Respuesta de Éxito
    // El objeto 'producto' ya viene en el formato 'Producto'
    res.status(200).json(producto);

  } catch (error) {
    console.error(`Error al obtener producto ${req.params.productoId}:`, error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};



const crearProducto = async (req, res) => {
  try {
    // 1. Obtener datos del body
    const datosProducto = req.body;

    // 2. Validación (según 'required' en 'ProductoInput')
    const { nombre, precio, stockInicial } = datosProducto;
    if (!nombre || precio === undefined || stockInicial === undefined) {
      return res.status(400).json({ 
        mensaje: "Datos inválidos. 'nombre', 'precio' y 'stockInicial' son requeridos." 
      });
    }

    // (Aquí irían más validaciones, ej. precio >= 0)

    // 3. Llamar al servicio
    const productoCreado = await productosServicio.crearProducto(datosProducto);

    // 4. Respuesta de Éxito
    // OpenAPI dice '201 Created' y devolver 'ProductoCreado'
    res.status(201).json(productoCreado);

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

/**
 * =======================================
 * Controlador para ACTUALIZAR un producto
 * =======================================
 * Ruta: PATCH /productos/{productoId}
 * * Recibe 'ProductoUpdate'.
 * * Devuelve 'Producto'.
 */
const actualizarProducto = async (req, res) => {
  try {
    // 1. Obtener ID de parámetros
    const { productoId } = req.params;
    
    // 2. Obtener datos del body
    const datosParaActualizar = req.body;

    // 3. Validación (básica)
    if (Object.keys(datosParaActualizar).length === 0) {
      return res.status(400).json({ 
        mensaje: "Cuerpo de la petición vacío. Nada que actualizar." 
      });
    }

    // 4. Llamar al servicio
    const productoActualizado = await productosServicio.actualizarProducto(
      productoId, 
      datosParaActualizar
    );

    // 5. Manejar 404 (si el producto no existía)
    // (Asumimos que si no existe, 'productoActualizado' será null)
    if (!productoActualizado) {
        return res.status(404).json({ 
            mensaje: `Producto con ID ${productoId} no encontrado.` 
        });
    }

    // 6. Respuesta de Éxito
    // OpenAPI dice '200 OK' y devolver el 'Producto' actualizado
    res.status(200).json(productoActualizado);

  } catch (error) {
    console.error(`Error al actualizar producto ${req.params.productoId}:`, error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};


/**
 * =======================================
 * Controlador para ELIMINAR un producto
 * =======================================
 * Ruta: DELETE /productos/{productoId}
 * * Responde con 204 No Content.
 */
const eliminarProducto = async (req, res) => {
  try {
    // 1. Obtener ID de parámetros
    const { productoId } = req.params;

    // 2. Llamar al servicio
    const productoBorrado = await productosServicio.eliminarProducto(productoId);

    // 3. Manejar "No Encontrado"
    if (!productoBorrado) {
      return res.status(404).json({ 
        mensaje: `Producto con ID ${productoId} no encontrado.` 
      });
    }

    // 4. Respuesta de Éxito
    // OpenAPI dice '204 No Content'
    res.status(204).send();

  } catch (error) {
    console.error(`Error al eliminar producto ${req.params.productoId}:`, error);
    // Manejar el error de restricción (FK) del servicio
    if (error.message.includes('reservas')) {
        return res.status(409).json({ mensaje: error.message }); // 409 Conflict
    }
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};


// --- Exportamos ---
export default {
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarProductos
};