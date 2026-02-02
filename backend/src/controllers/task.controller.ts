import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const taskService = new TaskService();

export class TaskController {
  /**
   * Create new task
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, title, description, priority, endDate, estimatedHours } = req.body;
    const userId = req.user!.id;

    const task = await taskService.createTask(userId, {
      projectId,
      title,
      description,
      priority,
      endDate: new Date(endDate),
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    });

    res.status(201).json({
      statusCode: 201,
      message: 'Tarefa criada com sucesso',
      data: task,
    });
  });

  /**
   * Get task by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);

    res.json({
      statusCode: 200,
      data: task,
    });
  });

  /**
   * Get tasks by project
   */
  static getByProject = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await taskService.getTasksByProject(projectId, page, pageSize);

    res.json({
      statusCode: 200,
      data: result,
    });
  });

  /**
   * Get tasks assigned to user
   */
  static getAssignedToMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await taskService.getTasksAssignedTo(userId, page, pageSize);

    res.json({
      statusCode: 200,
      data: result,
    });
  });

  /**
   * Get overdue tasks
   */
  static getOverdue = asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskService.getOverdueTasks();

    res.json({
      statusCode: 200,
      data: tasks,
    });
  });

  /**
   * Update task
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description, status, priority, actualHours, blockedReason } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (actualHours !== undefined) updateData.actualHours = parseFloat(actualHours);
    if (blockedReason) updateData.blockedReason = blockedReason;

    const task = await taskService.updateTask(id, userId, updateData);

    res.json({
      statusCode: 200,
      message: 'Tarefa atualizada com sucesso',
      data: task,
    });
  });

  /**
   * Delete task
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await taskService.deleteTask(id, userId);

    res.json({
      statusCode: 200,
      message: 'Tarefa deletada com sucesso',
    });
  });

  /**
   * Assign user to task
   */
  static assignUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId: assignedUserId } = req.body;
    const userId = req.user!.id;

    await taskService.assignUser(id, userId, assignedUserId);

    res.status(201).json({
      statusCode: 201,
      message: 'Usuário atribuído à tarefa',
    });
  });

  /**
   * Add comment to task
   */
  static addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { comment, isInternal } = req.body;
    const userId = req.user!.id;

    await taskService.addComment(id, userId, comment, isInternal || false);

    res.status(201).json({
      statusCode: 201,
      message: 'Comentário adicionado',
    });
  });
}
