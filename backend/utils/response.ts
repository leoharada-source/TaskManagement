import { Response } from 'express';
import { ApiResponse, AppError } from '../types';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string | AppError, statusCode?: number): void {
  const message = error instanceof AppError ? error.message : error;
  const code = statusCode || (error instanceof AppError ? error.statusCode : 500);
  
  const response: ApiResponse = {
    success: false,
    error: message
  };
  
  res.status(code).json(response);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendNotFound(res: Response, message: string = 'Resource not found'): void {
  sendError(res, message, 404);
}

export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message: string = 'Forbidden'): void {
  sendError(res, message, 403);
}

export function sendValidationError(res: Response, message: string): void {
  sendError(res, message, 400);
}

export function sendServerError(res: Response, message: string = 'Internal server error'): void {
  sendError(res, message, 500);
} 