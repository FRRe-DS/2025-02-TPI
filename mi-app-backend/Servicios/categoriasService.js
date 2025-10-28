

import supabase from '../dbConfig.js'; 

/**
 * ======================================================
 * Servicio para CREAR una categoría
 * ======================================================
 */
const crearCategoria = async (datosCategoria) => {
  // 'datosCategoria' es el 'CategoriaInput' (ej. { nombre, descripcion })
  const { data, error } = await supabase
    .from('categorias')
    .insert(datosCategoria)
    .select() // Devuelve la fila recién creada
    .single();

  if (error) {
    console.error('Error al crear categoría:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * ======================================================
 * Servicio para LISTAR todas las categorías
 * ======================================================
 */
const listarCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*'); // Trae todas las columnas

  if (error) {
    console.error('Error al listar categorías:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * ======================================================
 * Servicio para BUSCAR UNA categoría por ID
 * ======================================================
 */
const buscarCategoriaPorId = async (id) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single(); // Devuelve un objeto o null

  if (error && error.code !== 'PGRST116') { // Ignora 'No rows found'
    console.error('Error al buscar categoría:', error);
    throw new Error(error.message);
  }
  return data; // 'data' será null si no se encuentra
};

/**
 * ======================================================
 * Servicio para ACTUALIZAR una categoría
 * ======================================================
 */
const actualizarCategoria = async (id, datosCategoria) => {
  const { data, error } = await supabase
    .from('categorias')
    .update(datosCategoria)
    .eq('id', id)
    .select() // Devuelve la fila actualizada
    .single();

  if (error) {
    console.error('Error al actualizar categoría:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * ======================================================
 * Servicio para ELIMINAR una categoría
 * ======================================================
 */
const eliminarCategoria = async (id) => {
  const { data, error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .select('id'); // Devuelve el id borrado para confirmar

  if (error) {
    console.error('Error al eliminar categoría:', error);
    // 23503: Foreign key violation (un producto usa esta categoría)
    if (error.code === '23503') { 
      throw new Error('No se puede eliminar la categoría porque está siendo usada por uno o más productos.');
    }
    throw new Error(error.message);
  }
  return data;
};


// --- Exportamos todo ---
export default {
  crearCategoria,
  listarCategorias,
  buscarCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
};