// --- archivo: Rutas/reservasRoutes.js ---
import express from 'express';
const router = express.Router(); 
import reservasControlador from '../Controladores/reservasController.js';

// Importar validadores
import {
  validateGetReservas,
  validateCreateReserva,
  validateUpdateReserva,
  validateCancelarReserva,
  validateReservaId
} from '../middlewares/validators.js';

/*
 * =============================
 * Ruta: GET /reservas
 * =============================
 */
router.get('/', validateGetReservas, reservasControlador.listarReservas);

/*
 * =============================
 * Ruta: POST /reservas
 * =============================
 */
router.post('/', validateCreateReserva, reservasControlador.crearReserva);

/*
 * =============================
 * Ruta: GET /reservas/{idReserva}
 * =============================
 */
router.get('/:idReserva', validateReservaId, reservasControlador.obtenerReservaPorId);

/*
 * =============================
 * Ruta: PATCH /reservas/{idReserva}
 * =============================
 */
router.patch('/:idReserva', validateUpdateReserva, reservasControlador.actualizarReserva);

/*
 * =============================
 * Ruta: DELETE /reservas/{idReserva}
 * =============================
 */
router.delete('/:idReserva', validateCancelarReserva, reservasControlador.cancelarReserva);

// 3. Exportamos el 'router'
export default router;