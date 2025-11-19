// --- archivo: Rutas/productosRoutes.js ---
import express from 'express';
const router = express.Router();

// 1. Importamos el controlador
import productosControlador from '../Controladores/productosController.js';

// 2. Importamos validadores
import {
  validateGetProductos,
  validateCreateProducto,
  validateUpdateProducto,
  validateProductoId
} from '../middlewares/validators.js';

/*
 * =============================
 * Ruta: GET /productos
 * =============================
 */
router.get('/', validateGetProductos, productosControlador.listarProductos);

/*
 * =============================
 * Ruta: GET /productos/{productoId}
 * =============================
 */
router.get('/:productoId', validateProductoId, productosControlador.obtenerProductoPorId);

/*
 * =============================
 * Ruta: POST /productos
 * =============================
 */
router.post('/', validateCreateProducto, productosControlador.crearProducto);

/*
 * =============================
 * Ruta: PATCH /productos/{productoId}
 * =============================
 */
router.patch('/:productoId', validateUpdateProducto, productosControlador.actualizarProducto);

/*
 * =============================
 * Ruta: DELETE /productos/{productoId}
 * =============================
 */
router.delete('/:productoId', validateProductoId, productosControlador.eliminarProducto);

// 3. Exportamos el 'router'
export default router;