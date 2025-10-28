

import express from 'express';
const router = express.Router();
import categoriasControlador from '../Controladores/categoriasController.js';

// --- Definimos todas las rutas de Categorías ---

// GET / (Listar todas)
router.get('/', categoriasControlador.listarCategorias);

// POST / (Crear una)
router.post('/', categoriasControlador.crearCategoria);

// GET /:categoriaId (Obtener una)
router.get('/:categoriaId', categoriasControlador.obtenerCategoriaPorId);

// PATCH /:categoriaId (Actualizar una)
router.patch('/:categoriaId', categoriasControlador.actualizarCategoria);

// DELETE /:categoriaId (Eliminar una)
router.delete('/:categoriaId', categoriasControlador.eliminarCategoria);


// --- Exportamos el router ---
export default router;