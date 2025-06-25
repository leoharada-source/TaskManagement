import prisma from '../prisma';
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  UpdateTodoStatusRequest,
  Status,
  Importance,
  NotFoundError,
  ForbiddenError,
  ValidationError
} from '../types';
import { 
  validateRequired, 
  validateString, 
  validateBoolean, 
  validateEnum, 
  validateDate,
  validateUUID 
} from '../utils/validation';

export class TodoService {
  static async getAllTodos(userId: string): Promise<Todo[]> {
    return await prisma.todo.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getTodoById(id: string, userId: string): Promise<Todo> {
    const todo = await prisma.todo.findFirst({
      where: { id, userId },
      include: { category: true }
    });

    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    return todo;
  }

  static async createTodo(todoData: CreateTodoRequest, userId: string): Promise<Todo> {
    // Validate required fields
    validateRequired(todoData.title, 'Title');
    validateRequired(todoData.categoryId, 'Category ID');

    // Validate optional fields
    validateString(todoData.title, 'Title');
    validateString(todoData.description, 'Description');
    validateEnum(todoData.importance, Importance, 'Importance');
    validateEnum(todoData.status, Status, 'Status');
    validateBoolean(todoData.completed, 'Completed');
    validateDate(todoData.dueDate, 'Due date');
    validateUUID(todoData.categoryId, 'Category ID');

    // Verify category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: todoData.categoryId }
    });

    if (!category || category.userId !== userId) {
      throw new ValidationError('Invalid category');
    }

    // Create todo
    return await prisma.todo.create({
      data: {
        title: todoData.title,
        description: todoData.description,
        importance: todoData.importance || Importance.Medium,
        status: todoData.status || Status.Ready,
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : null,
        completed: todoData.completed || false,
        userId,
        categoryId: todoData.categoryId,
      },
      include: { category: true },
    });
  }

  static async updateTodo(id: string, updateData: UpdateTodoRequest, userId: string): Promise<Todo> {
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!existingTodo) {
      throw new NotFoundError('Todo not found');
    }

    // Validate fields if provided
    validateString(updateData.title, 'Title');
    validateString(updateData.description, 'Description');
    validateEnum(updateData.importance, Importance, 'Importance');
    validateEnum(updateData.status, Status, 'Status');
    validateBoolean(updateData.completed, 'Completed');
    validateDate(updateData.dueDate, 'Due date');

    // Validate category if being updated
    if (updateData.categoryId) {
      validateUUID(updateData.categoryId, 'Category ID');
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId }
      });

      if (!category || category.userId !== userId) {
        throw new ValidationError('Invalid category');
      }
    }

    // Build update data object
    const data: any = {};
    if (updateData.title !== undefined) data.title = updateData.title;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.importance !== undefined) data.importance = updateData.importance;
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.completed !== undefined) data.completed = updateData.completed;
    if (updateData.dueDate !== undefined) data.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    if (updateData.categoryId !== undefined) data.categoryId = updateData.categoryId;

    // Update todo
    return await prisma.todo.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  static async updateTodoStatus(id: string, statusData: UpdateTodoStatusRequest, userId: string): Promise<Todo> {
    // Validate status
    validateEnum(statusData.status, Status, 'Status');

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!existingTodo) {
      throw new NotFoundError('Todo not found');
    }

    // Update status
    return await prisma.todo.update({
      where: { id },
      data: { status: statusData.status },
      include: { category: true },
    });
  }

  static async deleteTodo(id: string, userId: string): Promise<void> {
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId }
    });

    if (!existingTodo) {
      throw new NotFoundError('Todo not found');
    }

    // Delete todo
    await prisma.todo.delete({
      where: { id }
    });
  }

  static async getTodosByStatus(status: Status, userId: string): Promise<Todo[]> {
    return await prisma.todo.findMany({
      where: { status, userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getTodosByCategory(categoryId: string, userId: string): Promise<Todo[]> {
    // Verify category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundError('Category not found');
    }

    return await prisma.todo.findMany({
      where: { categoryId, userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }
} 