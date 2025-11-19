// --- archivo: middlewares/validators.js ---
import { body, param, query, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Errores de validación',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// ============================================
// VALIDACIONES PARA PRODUCTOS
// ============================================

export const validateCreateProducto = [
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto')
    .trim()
    .isLength({ max: 500 }).withMessage('Descripción no puede exceder 500 caracteres'),
  
  body('precio')
    .notEmpty().withMessage('Precio es requerido')
    .isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  
  body('stockDisponible')
    .notEmpty().withMessage('Stock inicial es requerido')
    .isInt({ min: 0 }).withMessage('Stock debe ser un número entero positivo'),
  
  body('pesoKg')
    .optional()
    .isFloat({ min: 0 }).withMessage('Peso debe ser un número positivo'),
  
  body('dimensiones.largoCm')
    .optional()
    .isFloat({ min: 0 }).withMessage('Largo debe ser positivo'),
  
  body('dimensiones.anchoCm')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ancho debe ser positivo'),
  
  body('dimensiones.altoCm')
    .optional()
    .isFloat({ min: 0 }).withMessage('Alto debe ser positivo'),
  
  body('categoriaIds')
    .optional()
    .isArray().withMessage('categoriaIds debe ser un array')
    .custom((value) => {
      if (value && !value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs de categoría deben ser enteros positivos');
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateUpdateProducto = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),
  
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto')
    .trim()
    .isLength({ max: 500 }).withMessage('Descripción no puede exceder 500 caracteres'),
  
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  
  body('stockDisponible')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock debe ser un número entero positivo'),
  
  body('pesoKg')
    .optional()
    .isFloat({ min: 0 }).withMessage('Peso debe ser un número positivo'),
  
  handleValidationErrors
];

export const validateProductoId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido'),
  
  handleValidationErrors
];

export const validateGetProductos = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
  
  query('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('categoriaId debe ser un entero positivo'),
  
  handleValidationErrors
];

// ============================================
// VALIDACIONES PARA CATEGORÍAS
// ============================================

export const validateCreateCategoria = [
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto')
    .trim()
    .isLength({ max: 200 }).withMessage('Descripción no puede exceder 200 caracteres'),
  
  handleValidationErrors
];

export const validateUpdateCategoria = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto')
    .trim()
    .isLength({ max: 200 }).withMessage('Descripción no puede exceder 200 caracteres'),
  
  handleValidationErrors
];

export const validateCategoriaId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  
  handleValidationErrors
];

// ============================================
// VALIDACIONES PARA RESERVAS
// ============================================

export const validateCreateReserva = [
  body('idCompra')
    .notEmpty().withMessage('ID de compra es requerido')
    .isString().withMessage('ID de compra debe ser texto')
    .trim(),
  
  body('usuarioId')
    .notEmpty().withMessage('Usuario ID es requerido')
    .isInt({ min: 1 }).withMessage('Usuario ID debe ser un entero positivo'),
  
  body('productos')
    .notEmpty().withMessage('Productos es requerido')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.idProducto')
    .isInt({ min: 1 }).withMessage('ID de producto debe ser un entero positivo'),
  
  body('productos.*.cantidad')
    .isInt({ min: 1 }).withMessage('Cantidad debe ser un entero positivo'),
  
  handleValidationErrors
];

export const validateUpdateReserva = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de reserva inválido'),
  
  body('usuarioId')
    .notEmpty().withMessage('Usuario ID es requerido')
    .isInt({ min: 1 }).withMessage('Usuario ID debe ser un entero positivo'),
  
  body('estado')
    .notEmpty().withMessage('Estado es requerido')
    .isIn(['pendiente', 'confirmado', 'cancelado'])
    .withMessage('Estado debe ser: pendiente, confirmado o cancelado'),
  
  handleValidationErrors
];

export const validateCancelarReserva = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de reserva inválido'),
  
  body('motivo')
    .notEmpty().withMessage('Motivo es requerido')
    .isString().withMessage('Motivo debe ser texto')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Motivo debe tener entre 5 y 200 caracteres'),
  
  handleValidationErrors
];

export const validateGetReservas = [
  query('usuarioId')
    .notEmpty().withMessage('usuarioId es requerido')
    .isInt({ min: 1 }).withMessage('usuarioId debe ser un entero positivo'),
  
  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmado', 'cancelado', ''])
    .withMessage('Estado debe ser: pendiente, confirmado, cancelado o vacío'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
  
  handleValidationErrors
];

export const validateReservaId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de reserva inválido'),
  
  handleValidationErrors
];
