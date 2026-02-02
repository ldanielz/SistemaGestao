import { BaseRepository } from './base.repository';
import { prisma } from '../config/database';
import { Task } from '../types';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('Task', prisma.task);
  }

  /**
   * Find tasks by project
   */
  async findByProject(projectId: string) {
    try {
      return await prisma.task.findMany({
        where: { projectId },
        include: {
          assignees: { include: { user: true } },
          comments: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find tasks by status
   */
  async findByStatus(status: string) {
    try {
      return await prisma.task.findMany({
        where: { status },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find tasks assigned to user
   */
  async findAssignedTo(userId: string) {
    try {
      return await prisma.task.findMany({
        where: {
          assignees: {
            some: { userId },
          },
        },
        include: { project: true },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find overdue tasks
   */
  async findOverdue() {
    try {
      return await prisma.task.findMany({
        where: {
          endDate: {
            lt: new Date(),
          },
          status: { in: ['PENDING', 'IN_PROGRESS', 'IN_REVIEW'] },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign user to task
   */
  async assignUser(taskId: string, userId: string, allocatedHours?: number) {
    try {
      return await prisma.taskAssignee.create({
        data: {
          taskId,
          userId,
          allocatedHours,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: string, userId: string, comment: string, isInternal: boolean = false) {
    try {
      return await prisma.taskComment.create({
        data: {
          taskId,
          userId,
          comment,
          isInternal,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record task history
   */
  async recordHistory(taskId: string, fieldChanged: string, oldValue: string | null, newValue: string | null, changedById: string) {
    try {
      return await prisma.taskHistory.create({
        data: {
          taskId,
          fieldChanged,
          oldValue,
          newValue,
          changedById,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
