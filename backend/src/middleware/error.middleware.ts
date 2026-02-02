import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error handler caught exception', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      error: error.message,
      details: error.details,
    });
  }

  // Prisma unique constraint error
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        statusCode: 409,
        error: `${prismaError.meta?.target?.[0] || 'Campo'} já existe`,
      });
    }
  }

  return res.status(500).json({
    statusCode: 500,
    error: 'Erro interno do servidor',
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
