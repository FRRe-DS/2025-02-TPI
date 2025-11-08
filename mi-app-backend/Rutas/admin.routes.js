// ============================================
// RUTAS PARA PORTAL ADMINISTRATIVO (Vendedores)
// ============================================
// Rol requerido: 'vendedor'
// Protección aplicada en index.js a nivel de prefijo /api/v1/admin
//
// Endpoints disponibles:
// - GET    /api/v1/admin/productos
// - GET    /api/v1/admin/productos/:productoId
// - POST   /api/v1/admin/productos
// - PATCH  /api/v1/admin/productos/:productoId
// - DELETE /api/v1/admin/productos/:productoId
// - GET    /api/v1/admin/categorias
// - GET    /api/v1/admin/categorias/:categoriaId
// - POST   /api/v1/admin/categorias
// - PATCH  /api/v1/admin/categorias/:categoriaId
// - DELETE /api/v1/admin/categorias/:categoriaId
// ============================================

import express from 'express';
const router = express.Router();

// Importar controladores
import productosController from '../Controladores/productosController.js';
import categoriasController from '../Controladores/categoriasController.js';

// =============================
// PRODUCTOS (CRUD completo)
// =============================

/**
 * GET /productos
 * Lista todos los productos (con acceso completo)
 * Soporta paginación y filtros
 */
router.get('/productos', productosController.listarProductos);

/**
 * GET /productos/:productoId
 * Obtiene el detalle de un producto específico
 */
router.get('/productos/:productoId', productosController.obtenerProductoPorId);

/**
 * POST /productos
 * Crea un nuevo producto
 * 
 * Body: {
 *   nombre, descripcion, precio, stockInicial,
 *   pesoKg?, dimensiones?, ubicacion?, imagenes?, categoriaIds?
 * }
 * 
 * Campos opcionales pero recomendados para Logística:
 * - pesoKg: Peso del producto en kilogramos
 * - dimensiones: {largoCm, anchoCm, altoCm}
 * - ubicacion: Dirección del almacén donde se encuentra
 */
router.post('/productos', productosController.crearProducto);

/**
 * PATCH /productos/:productoId
 * Actualiza parcialmente un producto existente
 * 
 * Body: Cualquier campo del producto que desees actualizar
 * Ejemplo: { precio: 1599.99, stockInicial: 100 }
 */
router.patch('/productos/:productoId', productosController.actualizarProducto);

/**
 * DELETE /productos/:productoId
 * Elimina un producto del catálogo
 * 
 * Restricciones:
 * - No se puede eliminar si tiene reservas activas
 * - Se recomienda marcar como "inactivo" en lugar de eliminar
 */
router.delete('/productos/:productoId', productosController.eliminarProducto);

// =============================
// CATEGORÍAS (CRUD completo)
// =============================

/**
 * GET /categorias
 * Lista todas las categorías
 */
router.get('/categorias', categoriasController.listarCategorias);

/**
 * GET /categorias/:categoriaId
 * Obtiene el detalle de una categoría específica
 */
router.get('/categorias/:categoriaId', categoriasController.obtenerCategoriaPorId);

/**
 * POST /categorias
 * Crea una nueva categoría
 * 
 * Body: { nombre, descripcion? }
 */
router.post('/categorias', categoriasController.crearCategoria);

/**
 * PATCH /categorias/:categoriaId
 * Actualiza una categoría existente
 * 
 * Body: { nombre?, descripcion? }
 */
router.patch('/categorias/:categoriaId', categoriasController.actualizarCategoria);

/**
 * DELETE /categorias/:categoriaId
 * Elimina una categoría
 * 
 * Restricciones:
 * - No se puede eliminar si tiene productos asociados
 */
router.delete('/categorias/:categoriaId', categoriasController.eliminarCategoria);

// =============================
// REPORTES (Futuro)
// =============================

/**
 * GET /reportes/stock
 * Genera un reporte del estado actual del stock
 * (A IMPLEMENTAR)
 */
// router.get('/reportes/stock', reportesController.reporteStock);

/**
 * GET /reportes/reservas
 * Genera un reporte de reservas por período
 * (A IMPLEMENTAR)
 */
// router.get('/reportes/reservas', reportesController.reporteReservas);

/**
 * GET /reportes/ventas
 * Genera un reporte de productos más vendidos
 * (A IMPLEMENTAR)
 */
// router.get('/reportes/ventas', reportesController.reporteVentas);

export default router;
