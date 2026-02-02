import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCreateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Sobrenome deve ter pelo menos 2 caracteres'),
  body('role')
    .isIn(['ADMIN', 'MANAGER', 'LEAD', 'DEVELOPER', 'CLIENT'])
    .withMessage('Role inválido'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

export const validateCreateProject = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descrição muito longa'),
  body('startDate')
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('endDate')
    .isISO8601()
    .withMessage('Data de fim inválida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Data de fim deve ser após data de início');
      }
      return true;
    }),
  body('priority')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Prioridade inválida'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget deve ser um número positivo'),
];

export const validateCreateTask = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Título deve ter entre 5 e 255 caracteres'),
  body('projectId')
    .isUUID()
    .withMessage('Project ID inválido'),
  body('priority')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Prioridade inválida'),
  body('endDate')
    .isISO8601()
    .withMessage('Data de término inválida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data de término deve ser no futuro');
      }
      return true;
    }),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5 })
    .withMessage('Horas estimadas deve ser >= 0.5'),
];

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      statusCode: 422,
      error: 'Validação falhou',
      details: errors.array(),
    });
  }
  next();
}
