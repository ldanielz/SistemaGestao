import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators';

const router = Router();

// Middleware to require authentication
router.use(authMiddleware);

// Validation rules
const createTaskValidation = [
  body('projectId').isUUID().withMessage('Project ID inválido'),
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Título deve ter entre 5 e 255 caracteres'),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Prioridade inválida'),
  body('endDate').isISO8601().withMessage('Data de término inválida'),
  body('estimatedHours').optional().isFloat({ min: 0.5 }).withMessage('Horas estimadas deve ser >= 0.5'),
];

const updateTaskValidation = [
  body('title').optional().trim().isLength({ min: 5, max: 255 }),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('actualHours').optional().isFloat({ min: 0 }),
];

// Routes
router.post('/', createTaskValidation, handleValidationErrors, TaskController.create);
router.get('/assigned-to-me', TaskController.getAssignedToMe);
router.get('/overdue', TaskController.getOverdue);
router.get('/:id', TaskController.getById);
router.put('/:id', updateTaskValidation, handleValidationErrors, TaskController.update);
router.delete('/:id', TaskController.delete);

// Project tasks
router.get('/project/:projectId', TaskController.getByProject);

// Assignments and comments
router.post('/:id/assign',
  body('userId').isUUID().withMessage('User ID inválido'),
  handleValidationErrors,
  TaskController.assignUser
);
router.post('/:id/comments',
  body('comment').trim().isLength({ min: 1, max: 5000 }).withMessage('Comentário inválido'),
  body('isInternal').optional().isBoolean(),
  handleValidationErrors,
  TaskController.addComment
);

export default router;
