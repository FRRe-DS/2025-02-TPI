// --- archivo: Rutas/reservasRoutes.js ---
import express from 'express';
const router = express.Router(); 
import reservasControlador from '../Controladores/reservasController.js';

/*
 * =============================
 * Ruta: GET /reservas
 * =============================
 */
router.get('/', reservasControlador.listarReservas);

/*
 * =============================
 * Ruta: POST /reservas
 * =============================
 */
router.post('/', reservasControlador.crearReserva);

/*
 * =============================
 * Ruta: GET /reservas/{idReserva}
 * =============================
 */
router.get('/:idReserva', reservasControlador.obtenerReservaPorId);

/*
 * =============================
 * Ruta: PATCH /reservas/{idReserva}
 * =============================
 */
router.patch('/:idReserva', reservasControlador.actualizarReserva);

/*
 * =============================
 * Ruta: DELETE /reservas/{idReserva}
 * =============================
 */
router.delete('/:idReserva', reservasControlador.cancelarReserva);

// 3. Exportamos el 'router'
export default router;