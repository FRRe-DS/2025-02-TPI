

import express from 'express';
const router = express.Router();
import { requiredScopes } from 'express-oauth2-jwt-bearer';
import categoriasControlador from '../Controladores/categoriasController.js';

// --- Definimos todas las rutas de Categorías ---

// GET / (Listar todas)
router.get('/', requiredScopes('categorias:read'), categoriasControlador.listarCategorias);

// POST / (Crear una)
router.post('/', requiredScopes('categorias:write'), categoriasControlador.crearCategoria);

// GET /:categoriaId (Obtener una)
router.get('/:categoriaId', requiredScopes('categorias:read'), categoriasControlador.obtenerCategoriaPorId);

// PATCH /:categoriaId (Actualizar una)
router.patch('/:categoriaId', requiredScopes('categorias:write'), categoriasControlador.actualizarCategoria);

// DELETE /:categoriaId (Eliminar una)
router.delete('/:categoriaId', requiredScopes('categorias:write'), categoriasControlador.eliminarCategoria);

// --- Exportamos el router ---
export default router;