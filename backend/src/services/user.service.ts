import { UserRepository } from '../repositories/user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from '../types';
import { ApiError } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(404, 'Usuário não encontrado');
      }
      return user;
    } catch (error) {
      logger.error('Error getting user by ID', { error, userId });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      logger.error('Error getting user by email', { error, email });
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;
      return await this.userRepository.findAll({
        skip,
        take: pageSize,
        where: { status: 'ACTIVE' },
      });
    } catch (error) {
      logger.error('Error getting all users', { error });
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string) {
    try {
      return await this.userRepository.findByRole(role);
    } catch (error) {
      logger.error('Error getting users by role', { error, role });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(404, 'Usuário não encontrado');
      }

      const updateData: any = { ...data };

      // If password is being updated, hash it
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      const updated = await this.userRepository.update(userId, updateData);
      logger.info('User updated', { userId });
      return updated;
    } catch (error) {
      logger.error('Error updating user', { error, userId });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(404, 'Usuário não encontrado');
      }

      // Soft delete - just mark as inactive
      await this.userRepository.update(userId, { status: 'INACTIVE' });
      logger.info('User deleted', { userId });
    } catch (error) {
      logger.error('Error deleting user', { error, userId });
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(userId);
    } catch (error) {
      logger.error('Error updating last login', { error, userId });
      throw error;
    }
  }
}
