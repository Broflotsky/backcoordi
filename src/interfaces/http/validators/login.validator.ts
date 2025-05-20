import { body } from "express-validator";

export const loginValidator = [
    body('email').notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('El email debe ser válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];
