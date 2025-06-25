import { Request, Response } from 'express';
import { AuthenticatedRequest, CreateTodoRequest, UpdateTodoRequest, UpdateTodoStatusRequest, AppError } from '../types';
import { TodoService } from '../services/todoService';
import { sendSuccess, sendCreated, sendNoContent, sendError } from '../utils/response';

export class TodoController {
  static async getAllTodos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const todos = await TodoService.getAllTodos(req.user.id);
      sendSuccess(res, todos);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch todos');
    }
  }

  static async getTodoById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const todo = await TodoService.getTodoById(id, req.user.id);
      sendSuccess(res, todo);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch todo');
    }
  }

  static async createTodo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const todoData: CreateTodoRequest = req.body;
      const todo = await TodoService.createTodo(todoData, req.user.id);
      sendCreated(res, todo);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to create todo');
    }
  }

  static async updateTodo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const updateData: UpdateTodoRequest = req.body;
      const todo = await TodoService.updateTodo(id, updateData, req.user.id);
      sendSuccess(res, todo);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to update todo');
    }
  }

  static async updateTodoStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const statusData: UpdateTodoStatusRequest = req.body;
      const todo = await TodoService.updateTodoStatus(id, statusData, req.user.id);
      sendSuccess(res, todo);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to update todo status');
    }
  }

  static async deleteTodo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      await TodoService.deleteTodo(id, req.user.id);
      sendNoContent(res);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to delete todo');
    }
  }

  static async getTodosByStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { status } = req.params;
      const todos = await TodoService.getTodosByStatus(status as any, req.user.id);
      sendSuccess(res, todos);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch todos by status');
    }
  }

  static async getTodosByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { categoryId } = req.params;
      const todos = await TodoService.getTodosByCategory(categoryId, req.user.id);
      sendSuccess(res, todos);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch todos by category');
    }
  }
} 