import express from 'express';
const router = express.Router();
import categoriasControlador from '../Controladores/categoriasController.js';
import { keycloak } from '../keycloak-config.js';

// --- Definimos todas las rutas de Categorías ---

// GET / (Listar todas) - Público
router.get('/', categoriasControlador.listarCategorias);

// POST / (Crear una) - Protegida
router.post('/', keycloak.protect(), categoriasControlador.crearCategoria);

// GET /:categoriaId (Obtener una) - Público
router.get('/:categoriaId', categoriasControlador.obtenerCategoriaPorId);

// PATCH /:categoriaId (Actualizar una) - Protegida
router.patch('/:categoriaId', keycloak.protect(), categoriasControlador.actualizarCategoria);

// DELETE /:categoriaId (Eliminar una) - Protegida
router.delete('/:categoriaId', keycloak.protect(), categoriasControlador.eliminarCategoria);


// --- Exportamos el router ---
export default router;