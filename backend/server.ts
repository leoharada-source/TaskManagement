import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import todosRouter from './routes/todos';
import authRouter from './routes/auth';
import jwt from 'jsonwebtoken';
import categoriesRouter from './routes/categories';

const app = express();
const PORT = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const COOKIE_NAME = 'token';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware to set req.user from JWT
app.use((req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (req as any).user = { id: payload.userId };
    } catch {
      // ignore invalid token
    }
  }
  next();
});

// Routes
app.use('/api/todos', todosRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Start server directly (no Sequelize connection)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/todos`);
}); 