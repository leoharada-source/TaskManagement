import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle known application errors
  if (err instanceof AppError) {
    sendError(res, err);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        sendError(res, 'A record with this unique field already exists', 409);
        return;
      case 'P2025':
        sendError(res, 'Record not found', 404);
        return;
      case 'P2003':
        sendError(res, 'Foreign key constraint failed', 400);
        return;
      default:
        sendError(res, 'Database operation failed', 500);
        return;
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Handle syntax errors
  if (err instanceof SyntaxError) {
    sendError(res, 'Invalid JSON syntax', 400);
    return;
  }

  // Default error
  sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
} 