import { Router} from 'express';
import { registerController, loginController } from '../controllers/AuthController';
import { registerValidator } from '../validators/register.validator';
import { loginValidator } from '../validators/login.validator';
import { validation } from '../validators/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: Juan
 *               last_name:
 *                 type: string
 *                 description: Apellido del usuario
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del usuario
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 6 caracteres)
 *                 example: contraseña123
 *               address:
 *                 type: string
 *                 description: Dirección del usuario (opcional)
 *                 example: Calle 123 # 45-67, Bogotá
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error de validación o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Este email ya esta registrado
 */
router.post('/register', registerValidator, validation, registerController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Inicia sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: contraseña123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Credenciales inválidas.
 */
router.post('/login', loginValidator, validation, loginController);

export default router;