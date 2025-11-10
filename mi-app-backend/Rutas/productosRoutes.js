

import express from 'express';
const router = express.Router();
import { requiredScopes } from 'express-oauth2-jwt-bearer';
// 1. Importamos el controlador
import productosControlador from '../Controladores/productosController.js';

router.get('/', requiredScopes('productos:read'), productosControlador.listarProductos);
router.post('/', requiredScopes('productos:write'), productosControlador.crearProducto);
router.get('/:productoId', requiredScopes('productos:read'), productosControlador.obtenerProductoPorId);
router.patch('/:productoId', requiredScopes('productos:write'), productosControlador.actualizarProducto);
router.delete('/:productoId', requiredScopes('productos:write'), productosControlador.eliminarProducto);


// 3. Exportamos el 'router'
export default router;