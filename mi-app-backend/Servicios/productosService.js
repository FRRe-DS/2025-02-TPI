

import supabase from '../dbConfig.js';
import { validarImagenes, procesarImagenes } from '../utils/imageHelper.js'; 


// ===== HELPER DE MAPEO =====
const _mapProductoToOutput = (data) => {
  if (!data) return null;

  // Mapeamos las categorías anidadas
  // 'data.productos_categorias' es el array del JOIN
  // 'item.categorias' es el objeto anidado de la tabla 'categorias'
  const categoriasMapeadas = data.productos_categorias.map(item => {
    return {
      id: item.categorias.id,
      nombre: item.categorias.nombre,
      descripcion: item.categorias.descripcion
    };
  });

  // Mapeamos el producto principal
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio: parseFloat(data.precio_unitario), // Convertir de NUMERIC a float
    stockDisponible: data.stock_disponible,
    dimensiones: data.dimensiones,
    pesoKg: data.peso_kg ? parseFloat(data.peso_kg) : undefined,
    ubicacion: data.ubicacion,
    imagenes: data.imagenes || [], 
    categorias: categoriasMapeadas,
     
    
  };
};





/**
 * ======================================================
 * Servicio para LISTAR todos los productos (con filtros)
 * ======================================================
 */
const listarProductos = async (filtros) => {
  const { page, limit, q, categoriaId } = filtros;

  // 1. Empezamos la consulta con el JOIN a categorías,
  //    igual que en 'buscarProductoPorId'
  let query = supabase
    .from('productos')
    .select(`
      id,
      nombre,
      descripcion,
      precio_unitario,
      stock_disponible,
      dimensiones,
      ubicacion,
      imagenes,
      peso_kg,
      productos_categorias!inner (
        categorias (
          id,
          nombre,
          descripcion
        )
      )
    `);

  // 2. Aplicar filtro de búsqueda por texto ('q')
  if (q) {
    // Busca 'q' en el nombre O en la descripción
    query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`);
  }

  // 3. Aplicar filtro por 'categoriaId'
  if (categoriaId) {
    // !inner asegura que solo traiga productos que TENGAN categorías
    // El filtro se aplica sobre la tabla 'categorias' anidada
    query = query.eq('productos_categorias.categoria_id', categoriaId);
  }

  // 4. Aplicar paginación
  const pageNum = page || 1;
  const pageSize = limit || 10;
  const offset = (pageNum - 1) * pageSize;
  
  query = query.range(offset, offset + pageSize - 1);

  // 5. Ejecutar la consulta
  const { data, error } = await query;

  if (error) {
    console.error('Error al listar productos:', error);
    throw new Error(error.message);
  }

  // 6. Mapear CADA resultado
  // Reutilizamos el helper _mapProductoToOutput
  // Nota: Renombramos 'productos_categorias!inner' a 'productos_categorias'
  // para que el helper _mapProductoToOutput funcione sin cambios.
  const productosMapeados = data.map(item => {
    const itemCorregido = { ...item, productos_categorias: item['productos_categorias!inner'] || item.productos_categorias };
    return _mapProductoToOutput(itemCorregido);
  });
  
  return productosMapeados;
};







/**
 * ======================================================
 * Servicio para BUSCAR UN producto por su ID
 * ======================================================
 */
const buscarProductoPorId = async (id) => {
  // 1. Consultar a Supabase con JOIN
  // Traemos el producto y, anidados, sus categorías
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      descripcion,
      precio_unitario,
      stock_disponible,
      dimensiones,
      ubicacion,
      imagenes,
      peso_kg,
      productos_categorias (
        categorias (
          id,
          nombre,
          descripcion
        )
      )
    `)
    .eq('id', id)
    .single(); // .single() para que devuelva un objeto o null

  // 2. Manejar error
  if (error && error.code !== 'PGRST116') { // Ignora 'No rows found'
    console.error('Error en Supabase al buscar producto:', error);
    throw new Error(error.message);
  }

  // 3. Mapear y devolver
  return _mapProductoToOutput(data);
};



// ====='crearProducto' =====
const crearProducto = async (datosProducto) => {
  
  const { 
    nombre, descripcion, precio, stockInicial, categoriaIds,
    dimensiones,pesoKg, ubicacion, imagenes
  } = datosProducto;

  // 1. Validar imágenes si se proporcionaron
  if (imagenes && imagenes.length > 0) {
    const validacion = validarImagenes(imagenes);
    if (!validacion.valido) {
      throw new Error(`Error en imágenes: ${validacion.error}`);
    }
  }

  // 2. Procesar imágenes (convertir a CDN si es necesario)
  const imagenesProcesadas = imagenes ? procesarImagenes(imagenes) : [];

  // 3. Insertar en la tabla principal 'productos'
  const { data: productoData, error: productoError } = await supabase
    .from('productos')
    .insert({
      nombre: nombre,
      descripcion: descripcion,
      precio_unitario: precio,
      stock_disponible: stockInicial,
      dimensiones: dimensiones, 
      peso_kg: pesoKg,
      ubicacion: ubicacion,
      imagenes: imagenesProcesadas
    })
    .select('id')
    .single();
if (productoError) {
    console.error('Error al insertar producto:', productoError);
    throw new Error(productoError.message);
  }

  const nuevoProductoId = productoData.id;

  // 3. Insertar en la tabla 'productos_categorias' (si se proveyeron IDs)
  if (categoriaIds && categoriaIds.length > 0) {
    
    // Mapeamos el array de IDs al formato que Supabase espera
    const categoriasParaInsertar = categoriaIds.map(catId => ({
      producto_id: nuevoProductoId,
      categoria_id: catId
    }));

    const { error: catError } = await supabase
      .from('productos_categorias')
      .insert(categoriasParaInsertar);

    if (catError) {
      // Nota: Esto es un riesgo. El producto se creó pero sus categorías
      // fallaron. Una transacción (RPC) evitaría esto.
      console.error('Error al insertar categorías del producto:', catError);
      throw new Error(catError.message);
    }
  }

  // 4. Devolver la respuesta en formato 'ProductoCreado'
  return {
    id: nuevoProductoId,
    mensaje: "Producto creado exitosamente."
  };
};




/**
 * ======================================================
 * Servicio para ACTUALIZAR un producto
 * ======================================================
 */
const actualizarProducto = async (productoId, datosParaActualizar) => {
  const { categoriaIds, ...datosProducto } = datosParaActualizar;

  if (Object.keys(datosProducto).length > 0) {
    
    const datosMapeados = {
        nombre: datosProducto.nombre,
        descripcion: datosProducto.descripcion,
        precio_unitario: datosProducto.precio,
        stock_disponible: datosProducto.stockInicial,
        dimensiones: datosProducto.dimensiones,
        peso_kg: datosProducto.pesoKg,
        ubicacion: datosProducto.ubicacion,
        imagenes: datosProducto.imagenes
    };
    // Filtramos campos 'undefined' para no sobrescribir con null
    Object.keys(datosMapeados).forEach(key => 
        datosMapeados[key] === undefined && delete datosMapeados[key]
    );

    const { error: productoError } = await supabase
      .from('productos')
      .update(datosMapeados)
      .eq('id', productoId);

    if (productoError) {
      console.error('Error al actualizar producto:', productoError);
      throw new Error(productoError.message);
    }
  }

  // 3. Actualizar las categorías (si 'categoriaIds' fue enviado)
  // ¡Importante! 'categoriaIds' puede ser un array vacío []
  // lo que significa "quitarle todas las categorías".
  if (categoriaIds !== undefined) {
    
    // A. Borrar todas las categorías existentes para este producto
    const { error: deleteError } = await supabase
      .from('productos_categorias')
      .delete()
      .eq('producto_id', productoId);

    if (deleteError) {
      console.error('Error al borrar categorías antiguas:', deleteError);
      throw new Error(deleteError.message);
    }

    // B. Insertar las nuevas categorías (si el array no está vacío)
    if (categoriaIds.length > 0) {
      const categoriasParaInsertar = categoriaIds.map(catId => ({
        producto_id: productoId,
        categoria_id: catId
      }));

      const { error: insertError } = await supabase
        .from('productos_categorias')
        .insert(categoriasParaInsertar);

      if (insertError) {
        console.error('Error al insertar nuevas categorías:', insertError);
        throw new Error(insertError.message);
      }
    }
  }

  // 4. Devolver el producto completo y actualizado
  // Reutilizamos la función 'buscarProductoPorId' que ya hace
  // el JOIN y mapea la respuesta al formato 'Producto'.
  return await buscarProductoPorId(productoId);
};


/**
 * ======================================================
 * Servicio para ELIMINAR un producto
 * ======================================================
 */
const eliminarProducto = async (productoId) => {
  // 1. Intentar eliminar el producto
  const { data, error } = await supabase
    .from('productos')
    .delete()
    .eq('id', productoId)
    .select('id'); // Pedimos que nos devuelva el 'id' para saber si borró algo

  if (error) {
    console.error('Error al eliminar producto:', error);
    // Manejar el caso de que el producto esté en una reserva (FOREIGN KEY restriction)
    if (error.code === '23503') { // Foreign key violation
        throw new Error('No se puede eliminar el producto porque está asociado a una o más reservas.');
    }
    throw new Error(error.message);
  }

  // 2. Verificar si se borró algo
  // Si 'data' es null o un array vacío, el producto no existía
  if (!data || data.length === 0) {
    return null; // El controlador lo interpretará como un 404
  }

  return data[0]; // Devolvemos el objeto borrado (ej. { id: 1 })
};


// --- Exportamos ---
export default {
  buscarProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarProductos
};