

import express from 'express';
const router = express.Router();
import categoriasControlador from '../Controladores/categoriasController.js';

// Importar validadores
import {
  validateCreateCategoria,
  validateUpdateCategoria,
  validateCategoriaId
} from '../middlewares/validators.js';

// --- Definimos todas las rutas de Categorías ---

// GET / (Listar todas)
router.get('/', categoriasControlador.listarCategorias);

// POST / (Crear una)
router.post('/', validateCreateCategoria, categoriasControlador.crearCategoria);

// GET /:categoriaId (Obtener una)
router.get('/:categoriaId', validateCategoriaId, categoriasControlador.obtenerCategoriaPorId);

// PATCH /:categoriaId (Actualizar una)
router.patch('/:categoriaId', validateUpdateCategoria, categoriasControlador.actualizarCategoria);

// DELETE /:categoriaId (Eliminar una)
router.delete('/:categoriaId', validateCategoriaId, categoriasControlador.eliminarCategoria);


// --- Exportamos el router ---
export default router;