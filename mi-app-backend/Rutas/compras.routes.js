// compras.routes.js - Rutas para PORTAL DE COMPRAS (Clientes)
import express from 'express'
import verificarToken from '../middlewares/authMiddleware.js'
import productosController from '../Controladores/productosController.js'
import categoriasController from '../Controladores/categoriasController.js'
import reservasController from '../Controladores/reservasController.js'

const router = express.Router()

/**
 * ========================================
 * RUTAS PÚBLICAS (Sin autenticación)
 * Para que los clientes vean el catálogo
 * ========================================
 */

// GET /api/compras/productos - Ver catálogo de productos (PÚBLICO)
router.get('/productos', productosController.listarProductos)

// GET /api/compras/productos/:productoId - Ver detalle de producto (PÚBLICO)
router.get('/productos/:productoId', productosController.obtenerProductoPorId)

// GET /api/compras/categorias - Ver categorías (PÚBLICO)
router.get('/categorias', categoriasController.listarCategorias)

// GET /api/compras/productos/:id/disponibilidad - Verificar stock disponible (PÚBLICO)
router.get('/productos/:id/disponibilidad', async (req, res) => {
  try {
    const { id } = req.params
    const { cantidad } = req.query
    
    // Aquí llamarías al servicio para verificar stock
    // Por ahora es un placeholder
    res.status(200).json({
      disponible: true,
      stockActual: 10,
      message: `Hay stock suficiente para ${cantidad || 1} unidades`
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * ========================================
 * RUTAS PROTEGIDAS (Requieren autenticación)
 * Para gestionar reservas/compras
 * ========================================
 */

// POST /api/compras/reservas - Crear reserva (al concretar compra)
router.post('/reservas', verificarToken, reservasController.crearReserva)

// GET /api/compras/reservas - Listar MIS reservas
router.get('/reservas', verificarToken, reservasController.listarReservas)

// GET /api/compras/reservas/:idReserva - Ver detalle de MI reserva
router.get('/reservas/:idReserva', verificarToken, reservasController.obtenerReservaPorId)

// PATCH /api/compras/reservas/:idReserva - Actualizar reserva
router.patch('/reservas/:idReserva', verificarToken, reservasController.actualizarReserva)

// DELETE /api/compras/reservas/:idReserva - Cancelar MI reserva
router.delete('/reservas/:idReserva', verificarToken, reservasController.cancelarReserva)

export default router
