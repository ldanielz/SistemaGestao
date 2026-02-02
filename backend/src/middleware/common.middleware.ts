import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
    });
  });

  next();
}

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-Requested-With'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Aqui você pode integrar com redis-rate-limit
  // Por enquanto, apenas passa adiante
  next();
}
