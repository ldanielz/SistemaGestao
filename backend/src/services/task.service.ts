import { TaskRepository } from '../repositories/task.repository';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Create new task
   */
  async createTask(userId: string, data: CreateTaskDTO): Promise<Task> {
    try {
      // Validate dates
      if (data.endDate && new Date(data.endDate) <= new Date()) {
        throw new ApiError(400, 'Data de término deve ser no futuro');
      }

      const task = await this.taskRepository.create({
        ...data,
        createdById: userId,
      });

      logger.info('Task created', { taskId: task.id, userId });
      return task;
    } catch (error) {
      logger.error('Error creating task', { error, userId });
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(taskId, {
        assignees: { include: { user: true } },
        comments: { include: { user: true } },
        attachments: true,
      });
      if (!task) {
        throw new ApiError(404, 'Tarefa não encontrada');
      }
      return task;
    } catch (error) {
      logger.error('Error getting task', { error, taskId });
      throw error;
    }
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(projectId: string, page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const tasks = await this.taskRepository.findByProject(projectId);
      
      // Manual pagination
      const paginated = tasks.slice(skip, skip + pageSize);
      return {
        data: paginated,
        total: tasks.length,
        page,
        pageSize,
        totalPages: Math.ceil(tasks.length / pageSize),
      };
    } catch (error) {
      logger.error('Error getting tasks by project', { error, projectId });
      throw error;
    }
  }

  /**
   * Get tasks assigned to user
   */
  async getTasksAssignedTo(userId: string, page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const tasks = await this.taskRepository.findAssignedTo(userId);
      
      const paginated = tasks.slice(skip, skip + pageSize);
      return {
        data: paginated,
        total: tasks.length,
        page,
        pageSize,
        totalPages: Math.ceil(tasks.length / pageSize),
      };
    } catch (error) {
      logger.error('Error getting assigned tasks', { error, userId });
      throw error;
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks() {
    try {
      return await this.taskRepository.findOverdue();
    } catch (error) {
      logger.error('Error getting overdue tasks', { error });
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, userId: string, data: UpdateTaskDTO): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new ApiError(404, 'Tarefa não encontrada');
      }

      // Check authorization - creator or assigned user can update
      if (task.createdBy !== userId && !task.assignedTo?.includes(userId)) {
        throw new ApiError(403, 'Sem permissão para atualizar esta tarefa');
      }

      // Record history if status is changing
      if (data.status && data.status !== task.status) {
        await this.taskRepository.recordHistory(
          taskId,
          'status',
          task.status,
          data.status,
          userId
        );
      }

      const updated = await this.taskRepository.update(taskId, data);
      logger.info('Task updated', { taskId, userId });
      return updated;
    } catch (error) {
      logger.error('Error updating task', { error, taskId, userId });
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new ApiError(404, 'Tarefa não encontrada');
      }

      if (task.createdBy !== userId) {
        throw new ApiError(403, 'Sem permissão para deletar esta tarefa');
      }

      await this.taskRepository.delete(taskId);
      logger.info('Task deleted', { taskId, userId });
    } catch (error) {
      logger.error('Error deleting task', { error, taskId, userId });
      throw error;
    }
  }

  /**
   * Assign user to task
   */
  async assignUser(taskId: string, userId: string, assignedUserId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new ApiError(404, 'Tarefa não encontrada');
      }

      // Check authorization
      if (task.createdBy !== userId) {
        throw new ApiError(403, 'Sem permissão para atribuir usuários');
      }

      await this.taskRepository.assignUser(taskId, assignedUserId);
      logger.info('User assigned to task', { taskId, assignedUserId, userId });
    } catch (error) {
      logger.error('Error assigning user', { error, taskId, assignedUserId, userId });
      throw error;
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: string, userId: string, comment: string, isInternal: boolean = false): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new ApiError(404, 'Tarefa não encontrada');
      }

      await this.taskRepository.addComment(taskId, userId, comment, isInternal);
      logger.info('Comment added to task', { taskId, userId });
    } catch (error) {
      logger.error('Error adding comment', { error, taskId, userId });
      throw error;
    }
  }
}
