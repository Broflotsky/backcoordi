import { body } from 'express-validator';

export const shipmentStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['En espera', 'En transito', 'Entregado'])
    .withMessage('Estado inválido. Los valores permitidos son: En espera, En transito, Entregado'),
  
  body('comment')
    .optional()
    .isString()
    .withMessage('El comentario debe ser texto')
    .isLength({ max: 500 })
    .withMessage('El comentario no puede exceder 500 caracteres')
];
