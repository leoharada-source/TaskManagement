import { Request, Response } from 'express';
import { AuthenticatedRequest, LoginRequest, SignupRequest, AppError } from '../types';
import { AuthService } from '../services/authService';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

const COOKIE_NAME = 'token';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const userData: SignupRequest = req.body;
      const user = await AuthService.signup(userData);
      
      // Generate token and set cookie
      const token = AuthService.generateToken(user.id);
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: false, // false for local dev, true in production with HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      sendCreated(res, user);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Signup failed');
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;
      const user = await AuthService.login(credentials);
      
      // Generate token and set cookie
      const token = AuthService.generateToken(user.id);
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: false, // false for local dev, true in production with HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      sendSuccess(res, user);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Login failed');
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    sendSuccess(res, { success: true });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Not authenticated', 401);
        return;
      }

      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user);
    } catch (error) {
      sendError(res, error instanceof AppError ? error : 'Failed to get user');
    }
  }
} 