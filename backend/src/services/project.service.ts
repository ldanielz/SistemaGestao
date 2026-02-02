import { ProjectRepository } from '../repositories/project.repository';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '../types';
import { ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  /**
   * Create new project
   */
  async createProject(userId: string, data: CreateProjectDTO): Promise<Project> {
    try {
      // Validate dates
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        throw new ApiError(400, 'Data de fim deve ser após data de início');
      }

      const project = await this.projectRepository.create({
        ...data,
        ownerId: userId,
        createdById: userId,
      });

      logger.info('Project created', { projectId: project.id, userId });
      return project;
    } catch (error) {
      logger.error('Error creating project', { error, userId });
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }
      return project;
    } catch (error) {
      logger.error('Error getting project', { error, projectId });
      throw error;
    }
  }

  /**
   * Get project with members and tasks
   */
  async getProjectWithDetails(projectId: string) {
    try {
      const project = await this.projectRepository.findWithMembers(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }
      return project;
    } catch (error) {
      logger.error('Error getting project details', { error, projectId });
      throw error;
    }
  }

  /**
   * Get projects by owner
   */
  async getProjectsByOwner(ownerId: string, page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const projects = await this.projectRepository.findByOwner(ownerId);
      
      // Manual pagination
      const paginated = projects.slice(skip, skip + pageSize);
      return {
        data: paginated,
        total: projects.length,
        page,
        pageSize,
        totalPages: Math.ceil(projects.length / pageSize),
      };
    } catch (error) {
      logger.error('Error getting projects by owner', { error, ownerId });
      throw error;
    }
  }

  /**
   * Get all projects
   */
  async getAllProjects(page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;
      return await this.projectRepository.findAll({
        skip,
        take: pageSize,
        where: { status: { not: 'ARCHIVED' } },
      });
    } catch (error) {
      logger.error('Error getting all projects', { error });
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, userId: string, data: UpdateProjectDTO): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }

      // Check authorization
      if (project.ownerId !== userId) {
        throw new ApiError(403, 'Sem permissão para atualizar este projeto');
      }

      const updated = await this.projectRepository.update(projectId, data);
      logger.info('Project updated', { projectId, userId });
      return updated;
    } catch (error) {
      logger.error('Error updating project', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }

      if (project.ownerId !== userId) {
        throw new ApiError(403, 'Sem permissão para deletar este projeto');
      }

      await this.projectRepository.delete(projectId);
      logger.info('Project deleted', { projectId, userId });
    } catch (error) {
      logger.error('Error deleting project', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Add member to project
   */
  async addMember(projectId: string, userId: string, memberId: string, role: string = 'MEMBER'): Promise<void> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }

      if (project.ownerId !== userId) {
        throw new ApiError(403, 'Sem permissão para adicionar membros');
      }

      await this.projectRepository.addMember(projectId, memberId, role);
      logger.info('Member added to project', { projectId, memberId, userId });
    } catch (error) {
      logger.error('Error adding member', { error, projectId, memberId, userId });
      throw error;
    }
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, userId: string, memberId: string): Promise<void> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new ApiError(404, 'Projeto não encontrado');
      }

      if (project.ownerId !== userId) {
        throw new ApiError(403, 'Sem permissão para remover membros');
      }

      await this.projectRepository.removeMember(projectId, memberId);
      logger.info('Member removed from project', { projectId, memberId, userId });
    } catch (error) {
      logger.error('Error removing member', { error, projectId, memberId, userId });
      throw error;
    }
  }
}
