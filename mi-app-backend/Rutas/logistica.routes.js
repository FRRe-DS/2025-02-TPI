// ============================================
// RUTAS PARA PORTAL DE LOGÍSTICA (Grupo 3)
// ============================================
// Rol requerido: 'operador-logistica'
// Protección aplicada en index.js a nivel de prefijo /api/v1/logistica
//
// Endpoints disponibles:
// - GET  /api/v1/logistica/productos/:productoId
// - GET  /api/v1/logistica/reservas/:idReserva
// - GET  /api/v1/logistica/reservas/expiradas
// - POST /api/v1/logistica/reservas/:idReserva/reclamar
// - POST /api/v1/logistica/reservas/:idReserva/liberar
// ============================================

import express from 'express';
const router = express.Router();

// Importar controladores
import productosController from '../Controladores/productosController.js';
import reservasController from '../Controladores/reservasController.js';

// =============================
// PRODUCTOS (Con datos completos)
// =============================

/**
 * GET /productos/:productoId
 * Obtiene el detalle COMPLETO de un producto para cálculo de envío
 * 
 * Devuelve datos adicionales que Compras NO necesita:
 * - pesoKg: Para calcular costo de transporte
 * - dimensiones: {largoCm, anchoCm, altoCm} - Para calcular volumen
 * - ubicacion: {street, city, state, postal_code, country} - Dirección del almacén
 * 
 * Estos datos son consumidos por el módulo de Logística para:
 * 1. Calcular el costo de envío según peso y volumen
 * 2. Calcular distancia desde almacén (postal_code) hasta dirección de entrega
 * 3. Estimar tiempo de entrega según tipo de transporte
 */
router.get('/productos/:productoId', productosController.obtenerProductoDetallado);

// =============================
// RESERVAS (Gestión de entregas)
// =============================

/**
 * GET /reservas/expiradas
 * Lista todas las reservas que expiraron y deben liberar stock
 * Query params: page, limit (paginación)
 * 
 * Usado por Logística para procesar automáticamente las reservas vencidas
 * 
 * ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /reservas/:idReserva
 * para que Express no confunda "expiradas" con un ID de reserva
 */
router.get('/reservas/expiradas', reservasController.listarReservasExpiradas);

/**
 * GET /reservas/:idReserva
 * Obtiene el detalle de una reserva para gestionar la entrega
 * No requiere usuarioId en query (Logística puede ver todas las reservas)
 */
router.get('/reservas/:idReserva', reservasController.obtenerReservaPorId);

// =============================
// OPERACIONES ESPECIALES
// =============================

/**
 * POST /reservas/:idReserva/reclamar
 * Marca una reserva como "reclamada" por Logística
 * 
 * Flujo:
 * 1. Compras crea una reserva (estado: 'confirmado')
 * 2. Logística retira la mercadería del almacén
 * 3. Logística llama a este endpoint para marcar como 'reclamada'
 * 4. La reserva ya NO puede ser cancelada
 * 
 * Body: { operadorId, observaciones? }
 */
router.post('/reservas/:idReserva/reclamar', reservasController.reclamarReserva);

/**
 * POST /reservas/:idReserva/liberar
 * Libera el stock de una reserva expirada
 * 
 * Flujo:
 * 1. Una reserva expira (pasó el tiempo límite)
 * 2. Logística detecta la expiración (GET /reservas/expiradas)
 * 3. Logística llama a este endpoint para liberar el stock
 * 4. El stock vuelve a estar disponible
 * 5. Portal de Compras es notificado
 * 
 * Body: { motivo }
 */
router.post('/reservas/:idReserva/liberar', reservasController.liberarReserva);

export default router;
