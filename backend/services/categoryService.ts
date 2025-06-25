import prisma from '../prisma';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  NotFoundError,
  ValidationError
} from '../types';
import { validateRequired, validateString } from '../utils/validation';

export class CategoryService {
  static async getAllCategories(userId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getCategoryById(id: string, userId: string): Promise<Category> {
    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  static async createCategory(categoryData: CreateCategoryRequest, userId: string): Promise<Category> {
    // Validate input
    validateRequired(categoryData.name, 'Name');
    validateString(categoryData.name, 'Name');

    // Check if category with same name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: categoryData.name,
        userId 
      }
    });

    if (existingCategory) {
      throw new ValidationError('Category with this name already exists');
    }

    // Create category
    return await prisma.category.create({
      data: {
        name: categoryData.name,
        userId
      }
    });
  }

  static async updateCategory(id: string, updateData: UpdateCategoryRequest, userId: string): Promise<Category> {
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    // Validate input
    validateRequired(updateData.name, 'Name');
    validateString(updateData.name, 'Name');

    // Check if another category with same name already exists for this user
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: updateData.name,
        userId,
        id: { not: id } // Exclude current category
      }
    });

    if (duplicateCategory) {
      throw new ValidationError('Category with this name already exists');
    }

    // Update category
    return await prisma.category.update({
      where: { id },
      data: { name: updateData.name }
    });
  }

  static async deleteCategory(id: string, userId: string): Promise<void> {
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has associated todos
    const todosCount = await prisma.todo.count({
      where: { categoryId: id }
    });

    if (todosCount > 0) {
      throw new ValidationError('Cannot delete category with associated todos');
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });
  }

  static async getCategoryWithTodos(id: string, userId: string): Promise<Category & { todos: any[] }> {
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        todos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }
} 