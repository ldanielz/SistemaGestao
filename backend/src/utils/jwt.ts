import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types';

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export function generateAccessToken(user: User): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'sgps-api',
  });
}

export function generateRefreshToken(user: User): string {
  const payload = {
    sub: user.id,
    type: 'refresh',
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
}

export function verifyRefreshToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, {
      algorithms: ['HS256'],
    }) as { sub: string };
  } catch (error) {
    throw new Error('Refresh token inválido ou expirado');
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
