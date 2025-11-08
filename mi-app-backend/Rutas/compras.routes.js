// ============================================
// RUTAS PARA PORTAL DE COMPRAS (Grupo 1)
// ============================================
// Rol requerido: 'cliente-compras'
// Protección aplicada en index.js a nivel de prefijo /api/v1/compras
//
// Endpoints disponibles:
// - GET    /api/v1/compras/productos
// - GET    /api/v1/compras/productos/:productoId
// - GET    /api/v1/compras/categorias
// - GET    /api/v1/compras/categorias/:categoriaId
// - GET    /api/v1/compras/productos/:productoId/disponibilidad
// - POST   /api/v1/compras/reservas
// - GET    /api/v1/compras/reservas
// - GET    /api/v1/compras/reservas/:idReserva
// - PATCH  /api/v1/compras/reservas/:idReserva
// - DELETE /api/v1/compras/reservas/:idReserva
// ============================================

import express from 'express';
const router = express.Router();

// Importar controladores (lógica compartida)
import productosController from '../Controladores/productosController.js';
import reservasController from '../Controladores/reservasController.js';
import categoriasController from '../Controladores/categoriasController.js';

// =============================
// PRODUCTOS (Solo lectura)
// =============================

/**
 * GET /productos
 * Lista todos los productos disponibles en el catálogo
 * Soporta paginación y filtros (q, categoriaId)
 */
router.get('/productos', productosController.listarProductos);

/**
 * GET /productos/:productoId
 * Obtiene el detalle de un producto específico
 */
router.get('/productos/:productoId', productosController.obtenerProductoPorId);

/**
 * GET /productos/:productoId/disponibilidad
 * Verifica si hay stock disponible de un producto
 * Útil antes de agregar al carrito
 */
router.get('/productos/:productoId/disponibilidad', productosController.verificarDisponibilidad);

// =============================
// CATEGORÍAS (Solo lectura)
// =============================

/**
 * GET /categorias
 * Lista todas las categorías disponibles
 * Usado para filtros en la interfaz de compras
 */
router.get('/categorias', categoriasController.listarCategorias);

/**
 * GET /categorias/:categoriaId
 * Obtiene el detalle de una categoría específica
 */
router.get('/categorias/:categoriaId', categoriasController.obtenerCategoriaPorId);

// =============================
// RESERVAS (CRUD completo)
// =============================

/**
 * POST /reservas
 * Crea una nueva reserva y descuenta el stock
 * Body: { idCompra, usuarioId, productos: [{idProducto, cantidad}] }
 */
router.post('/reservas', reservasController.crearReserva);

/**
 * GET /reservas
 * Lista las reservas de un usuario
 * Query params: usuarioId (obligatorio), estado, page, limit
 */
router.get('/reservas', reservasController.listarReservas);

/**
 * GET /reservas/:idReserva
 * Obtiene el detalle completo de una reserva
 * Query param: usuarioId (obligatorio, para verificación)
 */
router.get('/reservas/:idReserva', reservasController.obtenerReservaPorId);

/**
 * PATCH /reservas/:idReserva
 * Actualiza el estado de una reserva
 * Body: { usuarioId, estado }
 */
router.patch('/reservas/:idReserva', reservasController.actualizarReserva);

/**
 * DELETE /reservas/:idReserva
 * Cancela una reserva y libera el stock
 * Body: { motivo }
 */
router.delete('/reservas/:idReserva', reservasController.cancelarReserva);

export default router;
