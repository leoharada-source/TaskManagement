import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { User, UserResponse, LoginRequest, SignupRequest, AuthResponse } from '../types';
import { ValidationError, UnauthorizedError } from '../types';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'token';

export class AuthService {
  static async signup(userData: SignupRequest): Promise<UserResponse> {
    // Validate input
    validateRequired(userData.email, 'Email');
    validateRequired(userData.password, 'Password');
    
    if (!validateEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }
    
    if (!validatePassword(userData.password)) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash
      }
    });

    return {
      id: user.id,
      email: user.email
    };
  }

  static async login(credentials: LoginRequest): Promise<UserResponse> {
    // Validate input
    validateRequired(credentials.email, 'Email');
    validateRequired(credentials.password, 'Password');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email
    };
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }

  static async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });

    return user;
  }
} 