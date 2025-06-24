import express, { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = express.Router();

// Middleware to require authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as { id: string } | undefined;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// Get all categories for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const categories = await prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
  res.json(categories);
});

// Create a new category
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const category = await prisma.category.create({ data: { name, userId: user.id } });
  res.status(201).json(category);
});

// Update a category
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== user.id) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.category.update({ where: { id }, data: { name } });
  res.json(updated);
});

// Delete a category
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const { id } = req.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== user.id) return res.status(404).json({ error: 'Not found' });
  await prisma.category.delete({ where: { id } });
  res.json({ success: true });
});

export default router; 