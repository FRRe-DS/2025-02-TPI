// --- archivo: Rutas/reservasRoutes.js ---
import express from 'express';
const router = express.Router(); 
import reservasControlador from '../Controladores/reservasController.js';
import { keycloak } from '../keycloak-config.js';

/*
 * =============================
 * Ruta: GET /reservas
 * =============================
 * Público - No requiere autenticación
 */
router.get('/', reservasControlador.listarReservas);

/*
 * =============================
 * Ruta: POST /reservas
 * =============================
 * Protegida - Requiere autenticación
 */
router.post('/', keycloak.protect(), reservasControlador.crearReserva);

/*
 * =============================
 * Ruta: GET /reservas/{idReserva}
 * =============================
 * Público - No requiere autenticación
 */
router.get('/:idReserva', reservasControlador.obtenerReservaPorId);

/*
 * =============================
 * Ruta: PATCH /reservas/{idReserva}
 * =============================
 * Protegida - Requiere autenticación
 */
router.patch('/:idReserva', keycloak.protect(), reservasControlador.actualizarReserva);

/*
 * =============================
 * Ruta: DELETE /reservas/{idReserva}
 * =============================
 * Protegida - Requiere autenticación
 */
router.delete('/:idReserva', keycloak.protect(), reservasControlador.cancelarReserva);

// 3. Exportamos el 'router'
export default router;