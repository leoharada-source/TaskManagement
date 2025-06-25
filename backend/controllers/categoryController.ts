import { Request, Response } from 'express';
import { AuthenticatedRequest, CreateCategoryRequest, UpdateCategoryRequest, AppError } from '../types';
import { CategoryService } from '../services/categoryService';
import { sendSuccess, sendCreated, sendNoContent, sendError } from '../utils/response';

export class CategoryController {
  static async getAllCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const categories = await CategoryService.getAllCategories(req.user.id);
      sendSuccess(res, categories);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch categories');
    }
  }

  static async getCategoryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id, req.user.id);
      sendSuccess(res, category);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch category');
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const categoryData: CreateCategoryRequest = req.body;
      const category = await CategoryService.createCategory(categoryData, req.user.id);
      sendCreated(res, category);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to create category');
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const updateData: UpdateCategoryRequest = req.body;
      const category = await CategoryService.updateCategory(id, updateData, req.user.id);
      sendSuccess(res, category);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to update category');
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      await CategoryService.deleteCategory(id, req.user.id);
      sendNoContent(res);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to delete category');
    }
  }

  static async getCategoryWithTodos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const category = await CategoryService.getCategoryWithTodos(id, req.user.id);
      sendSuccess(res, category);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to fetch category with todos');
    }
  }
} 