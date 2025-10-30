// --- archivo: rutas/reservas.rutas.js ---

import express from 'express';
const router = express.Router(); // Obtenemos el "enrutador" de Express
import { requiredScopes } from 'express-oauth2-jwt-bearer';
// 1. Importamos TODOS los controladores que creamos
import reservasControlador from '../Controladores/reservasController.js';


router.get('/', requiredScopes('reservas:read'), reservasControlador.listarReservas);
router.post('/', requiredScopes('reservas:write'), reservasControlador.crearReserva);
router.get('/:idReserva', requiredScopes('reservas:read'), reservasControlador.obtenerReservaPorId);
router.patch('/:idReserva', requiredScopes('reservas:write'), reservasControlador.actualizarReserva);
router.delete('/:idReserva', requiredScopes('reservas:write'), reservasControlador.cancelarReserva);





export default router;