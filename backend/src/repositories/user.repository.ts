import { BaseRepository } from './base.repository';
import { prisma } from '../config/database';
import { User } from '../types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('User', prisma.user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string) {
    try {
      return await prisma.user.findMany({
        where: { role },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find active users
   */
  async findActive() {
    try {
      return await prisma.user.findMany({
        where: { status: 'ACTIVE' },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      throw error;
    }
  }
}
