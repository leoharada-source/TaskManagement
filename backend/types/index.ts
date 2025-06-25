import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

// Todo types
export enum Importance {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum Status {
  Ready = 'Ready',
  InProgress = 'InProgress',
  Done = 'Done'
}

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  importance: Importance;
  status: Status;
  dueDate?: Date | null;
  completed: boolean;
  userId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  importance?: Importance;
  status?: Status;
  dueDate?: string;
  completed?: boolean;
  categoryId: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  importance?: Importance;
  status?: Status;
  dueDate?: string;
  completed?: boolean;
  categoryId?: string;
}

export interface UpdateTodoStatusRequest {
  status: Status;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
}

// Request augmentation
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
} 