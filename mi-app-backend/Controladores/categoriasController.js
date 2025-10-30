

import categoriasServicio from '../Servicios/categoriasService.js';

// --- POST /categorias ---
const crearCategoria = async (req, res) => {
  try {
    const datosCategoria = req.body; // { nombre, descripcion }
    // Validación (según 'required' en 'CategoriaInput')
    if (!datosCategoria.nombre) {
      return res.status(400).json({ mensaje: "El 'nombre' es obligatorio." });
    }
    const categoriaNueva = await categoriasServicio.crearCategoria(datosCategoria);
    res.status(201).json(categoriaNueva); // 201 Created
  } catch (error) {
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// --- GET /categorias ---
const listarCategorias = async (req, res) => {
  try {
    const categorias = await categoriasServicio.listarCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// --- GET /categorias/{categoriaId} ---
const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const categoria = await categoriasServicio.buscarCategoriaPorId(categoriaId);
    if (!categoria) {
      return res.status(404).json({ mensaje: `Categoría con ID ${categoriaId} no encontrada.` });
    }
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// --- PATCH /categorias/{categoriaId} ---
const actualizarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const datosCategoria = req.body;
    if (Object.keys(datosCategoria).length === 0) {
        return res.status(400).json({ mensaje: "Cuerpo vacío, nada que actualizar." });
    }
    const categoriaActualizada = await categoriasServicio.actualizarCategoria(categoriaId, datosCategoria);
    if (!categoriaActualizada) {
        return res.status(404).json({ mensaje: `Categoría con ID ${categoriaId} no encontrada.` });
    }
    res.status(200).json(categoriaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// --- DELETE /categorias/{categoriaId} ---
const eliminarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const [categoriaBorrada] = await categoriasServicio.eliminarCategoria(categoriaId);
    if (!categoriaBorrada) {
      return res.status(404).json({ mensaje: `Categoría con ID ${categoriaId} no encontrada.` });
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    // Manejar el error de FK (conflicto)
    if (error.message.includes('productos')) {
      return res.status(409).json({ mensaje: error.message }); // 409 Conflict
    }
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};


// --- Exportamos todo ---
export default {
  crearCategoria,
  listarCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
};