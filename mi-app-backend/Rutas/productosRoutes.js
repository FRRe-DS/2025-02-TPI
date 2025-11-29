// --- archivo: Rutas/productosRoutes.js ---
import express from 'express';
const router = express.Router();

// 1. Importamos el controlador
import productosControlador from '../Controladores/productosController.js';

// 2. Importamos keycloak para proteger rutas
import { keycloak } from '../keycloak-config.js';

/*
 * =============================
 * Ruta: GET /productos
 * =============================
 * Público - No requiere autenticación
 */
router.get('/', productosControlador.listarProductos);

/*
 * =============================
 * Ruta: GET /productos/{productoId}
 * =============================
 * Público - No requiere autenticación
 */
router.get('/:productoId', productosControlador.obtenerProductoPorId);

/*
 * =============================
 * Ruta: POST /productos
 * =============================
 * Protegida - Requiere autenticación
 */
router.post('/', keycloak.protect(), productosControlador.crearProducto);

/*
 * =============================
 * Ruta: PATCH /productos/{productoId}
 * =============================
 * Protegida - Requiere autenticación
 */
router.patch('/:productoId', keycloak.protect(), productosControlador.actualizarProducto);

/*
 * =============================
 * Ruta: DELETE /productos/{productoId}
 * =============================
 * Protegida - Requiere autenticación
 */
router.delete('/:productoId', keycloak.protect(), productosControlador.eliminarProducto);

// 3. Exportamos el 'router'
export default router;