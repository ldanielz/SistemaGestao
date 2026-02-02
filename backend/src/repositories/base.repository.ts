import { prisma } from '../config/database';
import { redis } from '../config/redis';
import logger from '../utils/logger';

export interface FindOptions {
  skip?: number;
  take?: number;
  where?: any;
  orderBy?: any;
  include?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Base Repository with generic CRUD operations
 * Provides common functionality for all repositories
 */
export abstract class BaseRepository<T> {
  protected cachePrefix: string;

  constructor(
    protected modelName: string,
    protected model: any
  ) {
    this.cachePrefix = `${modelName}:`;
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    try {
      const record = await this.model.create({
        data,
      });

      // Invalidate list cache
      await this.invalidateListCache();

      logger.info(`${this.modelName} created`, { id: record.id });
      return record;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, { error });
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    try {
      // Check cache first
      const cacheKey = `${this.cachePrefix}${id}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.debug(`Cache hit for ${this.modelName}:${id}`);
        return JSON.parse(cached);
      }

      const record = await this.model.findUnique({
        where: { id },
        include,
      });

      if (record) {
        // Cache for 1 hour
        await redis.setex(cacheKey, 3600, JSON.stringify(record));
      }

      return record;
    } catch (error) {
      logger.error(`Error finding ${this.modelName}`, { error, id });
      throw error;
    }
  }

  /**
   * Find all records with pagination and filters
   */
  async findAll(options: FindOptions = {}): Promise<PaginatedResult<T>> {
    try {
      const { skip = 0, take = 10, where = {}, orderBy = { createdAt: 'desc' }, include } = options;

      // Generate cache key based on query
      const cacheKey = `${this.cachePrefix}list:${JSON.stringify({
        skip,
        take,
        where,
      })}`;

      // Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${this.modelName} list`);
        return JSON.parse(cached);
      }

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take,
          orderBy,
          include,
        }),
        this.model.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);
      const result: PaginatedResult<T> = {
        data,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages,
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error(`Error finding all ${this.modelName}`, { error });
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: any): Promise<T> {
    try {
      const record = await this.model.update({
        where: { id },
        data,
      });

      // Invalidate caches
      await redis.del(`${this.cachePrefix}${id}`);
      await this.invalidateListCache();

      logger.info(`${this.modelName} updated`, { id });
      return record;
    } catch (error) {
      logger.error(`Error updating ${this.modelName}`, { error, id });
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id },
      });

      // Invalidate caches
      await redis.del(`${this.cachePrefix}${id}`);
      await this.invalidateListCache();

      logger.info(`${this.modelName} deleted`, { id });
      return true;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}`, { error, id });
      throw error;
    }
  }

  /**
   * Count records by filter
   */
  async count(where?: any): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error counting ${this.modelName}`, { error });
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const record = await this.model.findFirst({ where });
      return !!record;
    } catch (error) {
      logger.error(`Error checking existence of ${this.modelName}`, { error });
      throw error;
    }
  }

  /**
   * Invalidate list cache
   */
  protected async invalidateListCache(): Promise<void> {
    const keys = await redis.keys(`${this.cachePrefix}list:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
