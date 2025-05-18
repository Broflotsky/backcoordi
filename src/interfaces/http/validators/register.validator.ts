
import { body } from 'express-validator';

export const registerValidator = [
    body('first_name').notEmpty().withMessage('El nombre es obligatorio'),
    body('last_name').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('El email debe ser válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria').isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres'),
];   

