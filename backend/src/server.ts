import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { errorHandler, asyncHandler } from './middleware/error.middleware';
import { requestLogger, corsMiddleware } from './middleware/common.middleware';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(corsMiddleware);
app.use(requestLogger);

// Health check
app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    const dbHealth = prisma.$queryRaw`SELECT 1`;
    const redisHealth = redis.ping();

    const [_, pong] = await Promise.all([dbHealth, redisHealth]);

    res.json({
      statusCode: 200,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      services: {
        database: 'connected',
        redis: pong === 'PONG' ? 'connected' : 'disconnected',
      },
    });
  })
);

// Rotas
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

// Graceful Shutdown
const server = app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT} (${NODE_ENV})`);
});

async function gracefulShutdown() {
  logger.info('Iniciando shutdown gracioso...');

  server.close(async () => {
    logger.info('Server desligado');

    await prisma.$disconnect();
    logger.info('Prisma client desconectado');

    redis.disconnect();
    logger.info('Redis desconectado');

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forçando shutdown após 30 segundos');
    process.exit(1);
  }, 30000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default app;
