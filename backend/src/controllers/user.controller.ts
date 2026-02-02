import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const userService = new UserService();

export class UserController {
  /**
   * Get current user
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await userService.getUserById(userId);

    res.json({
      statusCode: 200,
      data: user,
    });
  });

  /**
   * Get user by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.json({
      statusCode: 200,
      data: user,
    });
  });

  /**
   * Get all users (admin only)
   */
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await userService.getAllUsers(page, pageSize);

    res.json({
      statusCode: 200,
      data: result,
    });
  });

  /**
   * Get users by role
   */
  static getByRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.params;

    const users = await userService.getUsersByRole(role);

    res.json({
      statusCode: 200,
      data: users,
    });
  });

  /**
   * Update user
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { firstName, lastName, phone, avatarUrl, password } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) updateData.password = password;

    const user = await userService.updateUser(userId, updateData);

    res.json({
      statusCode: 200,
      message: 'Usuário atualizado com sucesso',
      data: user,
    });
  });

  /**
   * Delete user
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await userService.deleteUser(userId);

    res.json({
      statusCode: 200,
      message: 'Usuário deletado com sucesso',
    });
  });

  /**
   * Update Role
   */
    static updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await userService.updateUser(id, { role });

    res.json({
      statusCode: 200,
      message: 'Role do usuário atualizado com sucesso',
      data: user,
    });
  });

  /**
   * Update Status
   */
    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = await userService.updateUser(id, { status });

    res.json({
      statusCode: 200,
      message: 'Status do usuário atualizado com sucesso',
      data: user,
    });
  });
}
