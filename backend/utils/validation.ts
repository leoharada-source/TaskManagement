import { ValidationError } from '../types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateString(value: any, fieldName: string): void {
  if (value !== undefined && typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }
}

export function validateBoolean(value: any, fieldName: string): void {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }
}

export function validateEnum(value: any, enumType: any, fieldName: string): void {
  if (value !== undefined && !Object.values(enumType).includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${Object.values(enumType).join(', ')}`);
  }
}

export function validateDate(value: any, fieldName: string): void {
  if (value !== undefined && value !== null) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid date`);
    }
  }
}

export function validateUUID(value: any, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (value && !uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }
} 