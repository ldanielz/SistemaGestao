import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Token não fornecido',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    return res.status(401).json({
      statusCode: 401,
      error: 'Token inválido ou expirado',
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        error: 'Não autorizado',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return res.status(403).json({
        statusCode: 403,
        error: 'Acesso negado: privilégios insuficientes',
      });
    }

    next();
  };
}
