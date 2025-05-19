import { body } from 'express-validator';

export const completeShipmentValidator = [
  body('comment')
    .optional()
    .isString()
    .withMessage('El comentario debe ser texto')
    .isLength({ max: 500 })
    .withMessage('El comentario no puede exceder 500 caracteres')
];
