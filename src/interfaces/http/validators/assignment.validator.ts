import { check } from 'express-validator';

export const assignmentValidator = [
  check('shipment_id')
    .isInt({ min: 1 })
    .withMessage('El ID del envío debe ser un número entero positivo'),
  
  check('route_id')
    .isInt({ min: 1 })
    .withMessage('El ID de la ruta debe ser un número entero positivo'),
  
  check('transporter_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del transportista debe ser un número entero positivo'),
  
  check('notes')
    .optional()
    .isString()
    .withMessage('Las notas deben ser texto')
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder los 500 caracteres')
];
