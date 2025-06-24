import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

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
  console.log('Cookies received:', req.cookies);
  const token = req.cookies[COOKIE_NAME];
  console.log('Token received:', token);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('JWT payload:', payload);
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
    const todos = await prisma.todo.findMany({ where: { userId: req.user!.id } });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET todo by id
router.get('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - create a new todo for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, description, importance, status, dueDate, completed } = req.body;
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        importance,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed: typeof completed === 'boolean' ? completed : false,
        userId: req.user!.id,
      },
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - update a todo (only if owned by user)
router.put('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - delete a todo (only if owned by user)
router.delete('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    await prisma.todo.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// PATCH update todo status (for drag and drop)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (!['Ready', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating todo status:', error);
    res.status(500).json({ error: 'Failed to update todo status' });
  }
});

export default router; 