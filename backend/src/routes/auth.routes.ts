import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import logger from '../utils/logger';
import { asyncHandler, ApiError } from '../middleware/error.middleware';
import { handleValidationErrors, validateLogin } from '../utils/validators';

const router = Router();

// Registrar novo usuário
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().isLength({ min: 2 }),
    body('lastName').trim().isLength({ min: 2 }),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, 'Email já registrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'DEVELOPER', // Role padrão para registros
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info('Novo usuário registrado', { userId: user.id, email });

    // Gerar tokens
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    // Armazenar refresh token no Redis
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60, // 7 dias
      refreshToken
    );

    res.status(201).json({
      statusCode: 201,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  })
);

// Login
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      logger.warn('Falha de login por senha incorreta', { email });
      throw new ApiError(401, 'Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Usuário inativo');
    }

    logger.info('Usuário logado com sucesso', {
      userId: user.id,
      email,
    });

    // Gerar tokens de user
    const userDataForToken = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as any,
      status: user.status as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const accessToken = generateAccessToken(userDataForToken);
    const refreshToken = generateRefreshToken(userDataForToken);

    // Armazenar refresh token no Redis
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    res.json({
      statusCode: 200,
      message: 'Login bem-sucedido',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

// Refresh token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty()],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const userId = decoded.sub;

      // Verificar se token está no Redis
      const storedToken = await redis.get(`refresh_token:${userId}`);

      if (storedToken !== refreshToken) {
        throw new ApiError(401, 'Refresh token inválido');
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new ApiError(401, 'Usuário não encontrado ou inativo');
      }

      // Gerar novo access token
      const userDataForToken = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any,
        status: user.status as any,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const newAccessToken = generateAccessToken(userDataForToken);

      res.json({
        statusCode: 200,
        message: 'Token renovado com sucesso',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      throw new ApiError(401, 'Token inválido ou expirado');
    }
  })
);

// Logout
router.post(
  '/logout',
  [body('userId').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;

    await redis.del(`refresh_token:${userId}`);

    logger.info('Usuário deslogado', { userId });

    res.json({
      statusCode: 200,
      message: 'Logout bem-sucedido',
    });
  })
);

export default router;
