

import express from 'express';
const router = express.Router();

// 1. Importamos el controlador
import productosControlador from '../Controladores/productosController.js';


/*
 * =============================
 * Ruta: GET /productos
 * =============================
 */
router.get('/', productosControlador.listarProductos);




/*
 * =============================
 * Ruta: GET /productos/{productoId}
 * =============================
 * operationId: obtenerProductoPorId
 */
router.get('/:productoId', productosControlador.obtenerProductoPorId);


/*
 * =============================
 * Ruta: POST /productos
 * =============================
 */
router.post('/', productosControlador.crearProducto);

/*
 * =============================
 * Ruta: PATCH /productos/{productoId}
 * =============================
 */
router.patch('/:productoId', productosControlador.actualizarProducto);

/*
 * =============================
 * Ruta: DELETE /productos/{productoId}
 * =============================
 */
router.delete('/:productoId', productosControlador.eliminarProducto);



// 3. Exportamos el 'router'
export default router;