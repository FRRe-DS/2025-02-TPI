// logistica.routes.js - Rutas para LOGÍSTICA (Transporte y entregas)
import express from 'express'
import reservasController from '../Controladores/reservasController.js'
import productosController from '../Controladores/productosController.js'

const router = express.Router()

/**
 * ========================================
 * RUTAS DE GESTIÓN DE RESERVAS
 * Base: /api/logistica/reservas
 * ========================================
 * IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
 */

// GET /api/logistica/reservas/expiradas - Listar reservas expiradas
router.get('/reservas/expiradas', async (req, res) => {
  try {
    // TODO: Implementar lógica para obtener reservas expiradas
    res.status(200).json({
      data: [],
      message: 'Reservas que superaron el tiempo límite'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/logistica/reservas - Listar reservas confirmadas (pendientes de recoger)
router.get('/reservas', reservasController.listarReservas)

// GET /api/logistica/reservas/:idReserva/productos - Obtener productos de una reserva con detalles (peso, ubicación)
router.get('/reservas/:idReserva/productos', async (req, res) => {
  try {
    const { idReserva } = req.params
    
    // TODO: Implementar lógica para obtener productos con detalles extras
    // Por ahora es un placeholder
    res.status(200).json({
      reservaId: idReserva,
      productos: [
        {
          id: 'producto-uuid',
          nombre: 'Laptop HP',
          cantidad: 2,
          peso: 2.5, // kg
          dimensiones: { largo: 35, ancho: 25, alto: 2 }, // cm
          ubicacionAlmacen: 'Almacén A - Pasillo 3 - Estante 2',
          centroDistribucion: 'Centro Norte',
          fragil: true
        }
      ]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/logistica/reservas/:idReserva/reclamar - Marcar mercadería como recogida
router.patch('/reservas/:idReserva/reclamar', async (req, res) => {
  try {
    const { idReserva } = req.params
    const { fechaRecogida } = req.body
    
    // TODO: Implementar lógica para marcar como reclamada
    // Estado: confirmado -> completado
    // NO devolver stock
    res.status(200).json({
      message: 'Reserva marcada como reclamada',
      reservaId: idReserva,
      estado: 'completado',
      fechaRecogida: fechaRecogida || new Date()
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/logistica/reservas/:idReserva/liberar - Liberar stock (por timeout/expiración)
router.patch('/reservas/:idReserva/liberar', async (req, res) => {
  try {
    const { idReserva } = req.params
    
    // TODO: Implementar lógica para liberar stock
    // Estado: confirmado -> cancelado
    // Devolver stock a productos
    // Notificar al Portal de Compras
    res.status(200).json({
      message: 'Stock liberado y reserva cancelada',
      reservaId: idReserva,
      estado: 'cancelado',
      motivo: 'Expiración de tiempo'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/logistica/reservas/:idReserva - Obtener detalle de una reserva
router.get('/reservas/:idReserva', reservasController.obtenerReservaPorId)

/**
 * ========================================
 * RUTAS DE INFORMACIÓN DE PRODUCTOS
 * Base: /api/logistica/productos
 * ========================================
 */

// GET /api/logistica/productos/:id/ubicacion - Obtener ubicación física en almacén
router.get('/productos/:id/ubicacion', async (req, res) => {
  try {
    const { id } = req.params
    
    // TODO: Implementar lógica para obtener ubicación
    res.status(200).json({
      productoId: id,
      almacen: 'Almacén A',
      pasillo: '3',
      estante: '2',
      nivel: '1',
      centroDistribucion: 'Centro Norte',
      coordenadas: {
        lat: -27.4511,
        lng: -58.9867
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/logistica/productos/:id/detalles - Obtener detalles para transporte
router.get('/productos/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params
    
    // TODO: Implementar lógica para obtener detalles de transporte
    res.status(200).json({
      productoId: id,
      peso: 2.5, // kg
      dimensiones: {
        largo: 35,
        ancho: 25,
        alto: 2
      },
      volumen: 1.75, // metros cúbicos
      fragil: true,
      refrigerado: false,
      apilable: false,
      instruccionesEspeciales: 'Mantener en posición horizontal'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
