import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators';

const router = Router();

// Middleware to require authentication
router.use(authMiddleware);

// Validation rules
const updateUserValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Sobrenome deve ter pelo menos 2 caracteres'),
  body('phone').optional().isMobilePhone('any').withMessage('Telefone inválido'),
  body('password').optional().isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres'),
];

// Routes
router.get('/me', UserController.getCurrentUser);
router.get('/:id', UserController.getById);
router.get('/role/:role', UserController.getByRole);

// Admin only
router.get('/', requireRole('ADMIN'), UserController.getAll);
// Update Role and Status - Admin only
router.patch(
  '/:id/role',
  requireRole('ADMIN'),
  [
    body('role')
      .isIn(['ADMIN', 'MANAGER', 'LEAD', 'DEVELOPER', 'CLIENT'])
      .withMessage('Role inválido'),
  ],
  handleValidationErrors,
  UserController.updateRole
);
router.patch(
  '/:id/status',
  requireRole('ADMIN'),
  [
    body('status')
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
      .withMessage('Status inválido'),
  ],
  handleValidationErrors,
  UserController.updateStatus
);

// User own profile
router.put('/me', updateUserValidation, handleValidationErrors, UserController.update);
router.delete('/me', UserController.delete);

export default router;
