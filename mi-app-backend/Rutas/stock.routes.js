// stock.routes.js - Rutas para VENDEDORES (Gestión de inventario)
import express from 'express'
import productosController from '../Controladores/productosController.js'
import categoriasController from '../Controladores/categoriasController.js'

const router = express.Router()

/**
 * ========================================
 * RUTAS DE PRODUCTOS (Solo vendedores)
 * Base: /api/stock/productos
 * ========================================
 */

// GET /api/stock/productos - Listar todos los productos
router.get('/productos', productosController.listarProductos)

// POST /api/stock/productos - Crear nuevo producto
router.post('/productos', productosController.crearProducto)

// GET /api/stock/productos/:productoId - Obtener producto por ID
router.get('/productos/:productoId', productosController.obtenerProductoPorId)

// PATCH /api/stock/productos/:productoId - Actualizar producto
router.patch('/productos/:productoId', productosController.actualizarProducto)

// DELETE /api/stock/productos/:productoId - Eliminar producto
router.delete('/productos/:productoId', productosController.eliminarProducto)

/**
 * ========================================
 * RUTAS DE CATEGORÍAS (Solo vendedores)
 * Base: /api/stock/categorias
 * ========================================
 */

// GET /api/stock/categorias - Listar todas las categorías
router.get('/categorias', categoriasController.listarCategorias)

// POST /api/stock/categorias - Crear nueva categoría
router.post('/categorias', categoriasController.crearCategoria)

// GET /api/stock/categorias/:categoriaId - Obtener categoría por ID
router.get('/categorias/:categoriaId', categoriasController.obtenerCategoriaPorId)

// PATCH /api/stock/categorias/:categoriaId - Actualizar categoría
router.patch('/categorias/:categoriaId', categoriasController.actualizarCategoria)

// DELETE /api/stock/categorias/:categoriaId - Eliminar categoría
router.delete('/categorias/:categoriaId', categoriasController.eliminarCategoria)

export default router
