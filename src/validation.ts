/**
 * Input validation functions for finance calculations
 */

import type { AmountCents, BasisPoints } from './types.ts';
import { MAX_SAFE_CENTS, MAX_SAFE_INTEGER } from './constants.ts';

/**
 * Validates that a value is a valid monetary amount in cents
 * @param value - The value to validate
 * @returns The validated amount in cents
 * @throws Error if the value is invalid
 */
export function validateAmountCents(value: unknown): AmountCents {
  // Check for null or undefined
  if (value == null) {
    throw new Error('Amount cannot be null or undefined');
  }

  // Check if it's a number
  if (typeof value !== 'number') {
    throw new Error(`Amount must be a number, received ${typeof value}`);
  }

  // Check for NaN
  if (Number.isNaN(value)) {
    throw new Error('Amount cannot be NaN');
  }

  // Check for infinity
  if (!Number.isFinite(value)) {
    throw new Error('Amount must be finite');
  }

  // Check if it's an integer (cents must be whole numbers)
  if (!Number.isInteger(value)) {
    throw new Error('Amount in cents must be an integer');
  }

  // Check for negative values
  if (value < 0) {
    throw new Error('Amount cannot be negative');
  }

  // Check for overflow
  if (value > MAX_SAFE_CENTS) {
    throw new Error(`Amount ${value} exceeds maximum safe value ${MAX_SAFE_CENTS}`);
  }

  return value;
}

/**
 * Validates that a value is a valid tax rate in basis points
 * @param value - The value to validate
 * @returns The validated basis points
 * @throws Error if the value is invalid
 */
export function validateBasisPoints(value: unknown): BasisPoints {
  // Check for null or undefined
  if (value == null) {
    throw new Error('Basis points cannot be null or undefined');
  }

  // Check if it's a number
  if (typeof value !== 'number') {
    throw new Error(`Basis points must be a number, received ${typeof value}`);
  }

  // Check for NaN
  if (Number.isNaN(value)) {
    throw new Error('Basis points cannot be NaN');
  }

  // Check for infinity
  if (!Number.isFinite(value)) {
    throw new Error('Basis points must be finite');
  }

  // Check if it's an integer (basis points must be whole numbers)
  if (!Number.isInteger(value)) {
    throw new Error('Basis points must be an integer');
  }

  // Check for negative values
  if (value < 0) {
    throw new Error('Basis points cannot be negative');
  }

  // Check for reasonable upper bound (1000000 bp = 10000% which is unreasonable for tax rates)
  if (value > 1000000) {
    throw new Error(`Basis points ${value} exceeds reasonable maximum of 1000000 (10000%)`);
  }

  return value;
}

/**
 * Checks if an arithmetic operation between two numbers would be safe
 * @param a - First operand
 * @param b - Second operand
 * @param operation - Description of the operation for error messages
 * @throws Error if the operation would cause overflow
 */
export function checkSafeOperation(a: number, b: number, operation: string): void {
  // Check individual values are safe
  if (!Number.isSafeInteger(a)) {
    throw new Error(`First operand ${a} is not a safe integer for ${operation}`);
  }

  if (!Number.isSafeInteger(b)) {
    throw new Error(`Second operand ${b} is not a safe integer for ${operation}`);
  }

  // Check specific operations
  if (operation.includes('addition') || operation.includes('add')) {
    if (a > 0 && b > 0 && a > MAX_SAFE_INTEGER - b) {
      throw new Error(`Addition overflow: ${a} + ${b} would exceed MAX_SAFE_INTEGER`);
    }
  } else if (operation.includes('subtraction') || operation.includes('subtract')) {
    if (a < 0 && b > 0 && a < -MAX_SAFE_INTEGER + b) {
      throw new Error(`Subtraction underflow: ${a} - ${b} would exceed safe integer range`);
    }
  } else if (operation.includes('multiplication') || operation.includes('multiply')) {
    if (a !== 0 && b !== 0) {
      const absA = Math.abs(a);
      const absB = Math.abs(b);
      if (absA > MAX_SAFE_INTEGER / absB) {
        throw new Error(`Multiplication overflow: ${a} * ${b} would exceed MAX_SAFE_INTEGER`);
      }
    }
  }
}
/**
 * Validates that a value is a valid number (for percentages and decimal amounts)
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns The validated number
 * @throws Error if the value is invalid
 */
export function validateNumber(value: unknown, fieldName: string): number {
  // Check for null or undefined
  if (value == null) {
    throw new Error(`${fieldName} cannot be null or undefined`);
  }

  // Check if it's a number
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number, received ${typeof value}`);
  }

  // Check for NaN
  if (Number.isNaN(value)) {
    throw new Error(`${fieldName} cannot be NaN`);
  }

  // Check for infinity
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be finite`);
  }

  // Check for negative values
  if (value < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }

  return value;
}

/**
 * Validates that a value is a valid integer for formatting (allows negative values)
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns The validated integer
 * @throws Error if the value is invalid
 */
export function validateIntegerForFormatting(value: unknown, fieldName: string): number {
  // Check for null or undefined
  if (value == null) {
    throw new Error(`${fieldName} cannot be null or undefined`);
  }

  // Check if it's a number
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number, received ${typeof value}`);
  }

  // Check for NaN
  if (Number.isNaN(value)) {
    throw new Error(`${fieldName} cannot be NaN`);
  }

  // Check for infinity
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be finite`);
  }

  // Check if it's an integer
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer`);
  }

  return value;
}

/**
 * Validates that a value is a valid number for formatting (allows negative values)
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns The validated number
 * @throws Error if the value is invalid
 */
export function validateNumberForFormatting(value: unknown, fieldName: string): number {
  // Check for null or undefined
  if (value == null) {
    throw new Error(`${fieldName} cannot be null or undefined`);
  }

  // Check if it's a number
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number, received ${typeof value}`);
  }

  // Check for NaN
  if (Number.isNaN(value)) {
    throw new Error(`${fieldName} cannot be NaN`);
  }

  // Check for infinity
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be finite`);
  }

  return value;
}