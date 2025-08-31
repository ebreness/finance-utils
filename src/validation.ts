/**
 * Input validation functions for finance calculations
 */

import type { AmountCents, BasisPoints, StringOrNumber } from './types.ts';
import { MAX_SAFE_CENTS, MAX_SAFE_INTEGER } from './constants.ts';

/**
 * Converts a string or number to a validated number
 * @param value - String or number input
 * @param fieldName - Field name for error messages
 * @returns Converted and validated number
 * @throws Error if conversion fails or validation fails
 */
export function convertToNumber(value: StringOrNumber, fieldName: string): number {
  // If already a number, validate it first
  if (typeof value === 'number') {
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
  
  // Handle string conversion
  if (typeof value === 'string') {
    // Trim whitespace
    const trimmed = value.trim();
    
    // Check for empty string
    if (trimmed === '') {
      throw new Error(`${fieldName} cannot be empty string`);
    }
    
    // Convert to number
    const converted = Number(trimmed);
    
    // Check if conversion was successful
    if (Number.isNaN(converted)) {
      throw new Error(`${fieldName} "${value}" is not a valid number`);
    }
    
    return converted;
  }
  
  // Handle other types
  throw new Error(`${fieldName} must be a string or number, received ${typeof value}`);
}

/**
 * Converts string or number to AmountCents with validation
 * @param value - String or number input
 * @returns Validated AmountCents
 * @throws Error if conversion or validation fails
 */
export function convertToAmountCents(value: StringOrNumber): AmountCents {
  const converted = convertToNumber(value, 'Amount');
  return validateAmountCents(converted);
}

/**
 * Converts string or number to BasisPoints with validation
 * @param value - String or number input
 * @returns Validated BasisPoints
 * @throws Error if conversion or validation fails
 */
export function convertToBasisPoints(value: StringOrNumber): BasisPoints {
  const converted = convertToNumber(value, 'Basis points');
  return validateBasisPoints(converted);
}

/**
 * Validates that a value is a valid monetary amount in cents
 * @param value - The value to validate (string or number)
 * @returns The validated amount in cents
 * @throws Error if the value is invalid
 */
export function validateAmountCents(value: StringOrNumber): AmountCents {
  // Convert string to number if needed
  const numericValue = convertToNumber(value, 'Amount');

  // Check if it's an integer (cents must be whole numbers)
  if (!Number.isInteger(numericValue)) {
    throw new Error('Amount in cents must be an integer');
  }

  // Check for negative values
  if (numericValue < 0) {
    throw new Error('Amount cannot be negative');
  }

  // Check for overflow
  if (numericValue > MAX_SAFE_CENTS) {
    throw new Error(`Amount ${numericValue} exceeds maximum safe value ${MAX_SAFE_CENTS}`);
  }

  return numericValue;
}

/**
 * Validates that a value is a valid tax rate in basis points
 * @param value - The value to validate (string or number)
 * @returns The validated basis points
 * @throws Error if the value is invalid
 */
export function validateBasisPoints(value: StringOrNumber): BasisPoints {
  // Convert string to number if needed
  const numericValue = convertToNumber(value, 'Basis points');

  // Check if it's an integer (basis points must be whole numbers)
  if (!Number.isInteger(numericValue)) {
    throw new Error('Basis points must be an integer');
  }

  // Check for negative values
  if (numericValue < 0) {
    throw new Error('Basis points cannot be negative');
  }

  // Check for reasonable upper bound (1000000 bp = 10000% which is unreasonable for tax rates)
  if (numericValue > 1000000) {
    throw new Error(`Basis points ${numericValue} exceeds reasonable maximum of 1000000 (10000%)`);
  }

  return numericValue;
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
 * @param value - The value to validate (string or number)
 * @param fieldName - Name of the field for error messages
 * @returns The validated number
 * @throws Error if the value is invalid
 */
export function validateNumber(value: StringOrNumber, fieldName: string): number {
  // Convert string to number if needed
  const numericValue = convertToNumber(value, fieldName);

  // Check for negative values
  if (numericValue < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }

  return numericValue;
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