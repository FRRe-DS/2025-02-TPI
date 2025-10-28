

import express from 'express';
const router = express.Router(); // Obtenemos el "enrutador" de Express

// 1. Importamos TODOS los controladores que creamos
import reservasControlador from '../Controladores/reservasController.js';

// 2. Definimos las rutas y las conectamos a los controladores
// Basado 100% en tu openapi.yaml

/*
 * =============================
 * Ruta: GET /reservas
 * =============================
 * operationId: listarReservas
 */
router.get('/', reservasControlador.listarReservas);

/*
 * =============================
 * Ruta: POST /reservas
 * =============================
 * operationId: crearReserva
 */
router.post('/', reservasControlador.crearReserva);

/*
 * =============================
 * Ruta: GET /reservas/{idReserva}
 * =============================
 * operationId: obtenerReservaPorId
 * Nota: Express usa ':idReserva' para capturar el parámetro
 */
router.get('/:idReserva', reservasControlador.obtenerReservaPorId);

/*
 * =============================
 * Ruta: PATCH /reservas/{idReserva}
 * =============================
 * operationId: actualizarReserva
 */
router.patch('/:idReserva', reservasControlador.actualizarReserva);

/*
 * =============================
 * Ruta: DELETE /reservas/{idReserva}
 * =============================
 * operationId: cancelarReserva
 */
router.delete('/:idReserva', reservasControlador.cancelarReserva);







// 3. Exportamos el 'router'
// Lo exportamos para que el archivo principal de la app (index.js o app.js) pueda usarlo.
export default router;
