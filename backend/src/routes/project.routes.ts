import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators';

const router = Router();

// Middleware to require authentication
router.use(authMiddleware);

// Validation rules
const createProjectValidation = [
  body('name').trim().isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('startDate').isISO8601().withMessage('Data de início inválida'),
  body('endDate').isISO8601().withMessage('Data de fim inválida'),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Prioridade inválida'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget deve ser um número positivo'),
];

const updateProjectValidation = [
  body('name').optional().trim().isLength({ min: 3, max: 255 }),
  body('status').optional().isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
];

// Routes
router.get('/', ProjectController.getAll);
router.post('/', createProjectValidation, handleValidationErrors, ProjectController.create);

router.get('/my-projects', ProjectController.getByOwner);
router.get('/:id', ProjectController.getById);
router.put('/:id', updateProjectValidation, handleValidationErrors, ProjectController.update);
router.delete('/:id', ProjectController.delete);

// Members
router.post('/:id/members', 
  body('userId').isUUID().withMessage('User ID inválido'),
  body('role').optional().isIn(['MEMBER', 'LEAD', 'MANAGER']),
  handleValidationErrors,
  ProjectController.addMember
);
router.delete('/:id/members/:memberId', ProjectController.removeMember);

export default router;
