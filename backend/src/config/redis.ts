import Redis from 'ioredis';
import logger from '../utils/logger.ts';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});


