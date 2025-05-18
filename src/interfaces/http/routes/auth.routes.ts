import { Router} from 'express';
import { registerController, loginController } from '../controllers/AuthController';
import { registerValidator } from '../validators/register.validator';
import { loginValidator } from '../validators/login.validator';
import { validation } from '../validators/validation';

const router = Router();

router.post('/register', registerValidator, validation, registerController);
router.post('/login', loginValidator, validation, loginController);

export default router;