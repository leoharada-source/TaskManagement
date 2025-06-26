import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { Status } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string };
  }
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const COOKIE_NAME = 'token';

// JWT auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    console.log('JWT verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// All routes below require authentication
router.use(requireAuth);

// GET /api/todos - get all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({ where: { userId: req.user!.id }, include: { category: true } });
    res.json({ success: true, data: todos });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch todos' });
  }
});

// GET todo by id
router.get('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: { category: true } });
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - create a new todo for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, description, importance, status, dueDate, completed, categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ success: false, error: 'categoryId is required' });
    // Validate category belongs to user
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.userId !== req.user!.id) return res.status(400).json({ success: false, error: 'Invalid category' });
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        importance,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed: typeof completed === 'boolean' ? completed : false,
        userId: req.user!.id,
        categoryId,
      },
      include: { category: true },
    });
    res.status(201).json({ success: true, data: todo });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - update a todo (only if owned by user)
router.put('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!todo) return res.status(404).json({ success: false, error: 'Todo not found' });
    
    const { categoryId, title, description, importance, dueDate, status, completed } = req.body;
    
    // Validate category if it's being updated
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== req.user!.id) return res.status(400).json({ success: false, error: 'Invalid category' });
    }
    
    // Only update allowed fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (importance !== undefined) updateData.importance = importance;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;
    if (completed !== undefined) updateData.completed = completed;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    
    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true },
    });
    
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ success: false, error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - delete a todo (only if owned by user)
router.delete('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!todo) return res.status(404).json({ success: false, error: 'Todo not found' });
    await prisma.todo.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete todo' });
  }
});

// PATCH update todo status (for drag and drop)
router.patch('/:id/status', async (req, res) => {
  try {
    const status: string = req.body.status;
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }

    const statusMap: Record<string, string> = {
      'Ready': 'Ready',
      'In Progress': 'InProgress',
      'InProgress': 'InProgress',
      'Done': 'Done'
    };
    const prismaStatus = statusMap[status];
    if (!prismaStatus) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: { status: Status[prismaStatus as keyof typeof Status] },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating todo status:', error);
    res.status(500).json({ success: false, error: 'Failed to update todo status' });
  }
});

export default router; 