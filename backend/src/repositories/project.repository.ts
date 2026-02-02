import { BaseRepository } from './base.repository';
import { prisma } from '../config/database';
import { Project } from '../types';

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('Project', prisma.project);
  }

  /**
   * Find projects by owner
   */
  async findByOwner(ownerId: string) {
    try {
      return await prisma.project.findMany({
        where: { ownerId },
        include: { members: true },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find projects by status
   */
  async findByStatus(status: string) {
    try {
      return await prisma.project.findMany({
        where: { status },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find projects with members
   */
  async findWithMembers(id: string) {
    try {
      return await prisma.project.findUnique({
        where: { id },
        include: {
          members: {
            include: { user: true },
          },
          tasks: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add member to project
   */
  async addMember(projectId: string, userId: string, role: string = 'MEMBER', hoursAllocated: number = 40) {
    try {
      return await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role,
          hoursAllocated,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, userId: string) {
    try {
      await prisma.projectMember.deleteMany({
        where: { projectId, userId },
      });
    } catch (error) {
      throw error;
    }
  }
}
