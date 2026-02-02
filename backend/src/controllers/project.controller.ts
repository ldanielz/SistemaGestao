import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const projectService = new ProjectService();

export class ProjectController {
  /**
   * Create new project
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, startDate, endDate, priority, budget } = req.body;
    const userId = req.user!.id;

    const project = await projectService.createProject(userId, {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priority,
        budget: budget ? parseFloat(budget) : undefined,
        ownerId: userId
    });

    res.status(201).json({
      statusCode: 201,
      message: 'Projeto criado com sucesso',
      data: project,
    });
  });

  /**
   * Get project by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await projectService.getProjectWithDetails(id);

    res.json({
      statusCode: 200,
      data: project,
    });
  });

  /**
   * Get all projects
   */
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await projectService.getAllProjects(page, pageSize);

    res.json({
      statusCode: 200,
      data: result,
    });
  });

  /**
   * Get projects by owner
   */
  static getByOwner = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await projectService.getProjectsByOwner(userId, page, pageSize);

    res.json({
      statusCode: 200,
      data: result,
    });
  });

  /**
   * Update project
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description, status, priority, budget } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (budget) updateData.budget = parseFloat(budget);

    const project = await projectService.updateProject(id, userId, updateData);

    res.json({
      statusCode: 200,
      message: 'Projeto atualizado com sucesso',
      data: project,
    });
  });

  /**
   * Delete project
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await projectService.deleteProject(id, userId);

    res.json({
      statusCode: 200,
      message: 'Projeto deletado com sucesso',
    });
  });

  /**
   * Add member to project
   */
  static addMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId: memberId, role } = req.body;
    const userId = req.user!.id;

    await projectService.addMember(id, userId, memberId, role || 'MEMBER');

    res.status(201).json({
      statusCode: 201,
      message: 'Membro adicionado ao projeto',
    });
  });

  /**
   * Remove member from project
   */
  static removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, memberId } = req.params;
    const userId = req.user!.id;

    await projectService.removeMember(id, userId, memberId);

    res.json({
      statusCode: 200,
      message: 'Membro removido do projeto',
    });
  });
}
