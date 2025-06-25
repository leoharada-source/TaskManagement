import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UnauthorizedError } from '../types';
import { sendUnauthorized } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const COOKIE_NAME = 'token';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies[COOKIE_NAME];
  
  if (!token) {
    sendUnauthorized(res, 'Authentication token required');
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as AuthenticatedRequest).user = { id: payload.userId };
    next();
  } catch (err) {
    console.log('JWT verification failed:', err);
    sendUnauthorized(res, 'Invalid or expired token');
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies[COOKIE_NAME];
  
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (req as AuthenticatedRequest).user = { id: payload.userId };
    } catch (err) {
      // Ignore invalid token for optional auth
      console.log('Optional auth - JWT verification failed:', err);
    }
  }
  
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthenticatedRequest).user;
  
  if (!user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }
  
  next();
} 