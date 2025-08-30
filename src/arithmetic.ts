/**
 * Safe arithmetic operations for monetary amounts
 * 
 * This module provides safe arithmetic functions that work with integer cents
 * and include overflow protection to prevent precision errors.
 */

import type { AmountCents } from './types.ts';
import { validateAmountCents, checkSafeOperation, validateNumberForFormatting } from './validation.ts';

/**
 * Safely add two monetary amounts in cents
 * 
 * @param a - First amount in cents
 * @param b - Second amount in cents
 * @returns Sum of the two amounts in cents
 * @throws Error if inputs are invalid or operation would cause overflow
 * 
 * @example
 * safeAdd(12345, 6789) // returns 19134
 * safeAdd(100, 200) // returns 300
 */
export function safeAdd(a: AmountCents, b: AmountCents): AmountCents {
  const validA = validateAmountCents(a);
  const validB = validateAmountCents(b);
  
  // Check for overflow before performing operation
  checkSafeOperation(validA, validB, 'addition');
  
  return validA + validB;
}

/**
 * Safely subtract two monetary amounts in cents
 * 
 * @param a - Amount to subtract from (minuend) in cents
 * @param b - Amount to subtract (subtrahend) in cents
 * @returns Difference of the two amounts in cents
 * @throws Error if inputs are invalid, result would be negative, or operation would cause underflow
 * 
 * @example
 * safeSubtract(12345, 6789) // returns 5556
 * safeSubtract(1000, 200) // returns 800
 */
export function safeSubtract(a: AmountCents, b: AmountCents): AmountCents {
  const validA = validateAmountCents(a);
  const validB = validateAmountCents(b);
  
  // Check that result won't be negative (monetary amounts should be non-negative)
  if (validA < validB) {
    throw new Error(`Subtraction would result in negative amount: ${validA} - ${validB} = ${validA - validB}`);
  }
  
  // Check for underflow before performing operation
  checkSafeOperation(validA, validB, 'subtraction');
  
  return validA - validB;
}

/**
 * Safely multiply a monetary amount by a factor with proper rounding
 * 
 * @param amount - Amount in cents to multiply
 * @param factor - Factor to multiply by (can be decimal)
 * @returns Product rounded to nearest cent
 * @throws Error if inputs are invalid or operation would cause overflow
 * 
 * @example
 * safeMultiply(12345, 2) // returns 24690
 * safeMultiply(12345, 1.5) // returns 18518 (rounded from 18517.5)
 * safeMultiply(100, 0.13) // returns 13
 */
export function safeMultiply(amount: AmountCents, factor: number): AmountCents {
  const validAmount = validateAmountCents(amount);
  
  // Validate factor using existing validation function
  // Note: validateNumberForFormatting allows negative values, so we need an additional check
  const validFactor = validateNumberForFormatting(factor, 'Factor');
  
  if (validFactor < 0) {
    throw new Error('Factor cannot be negative');
  }
  
  // Check for potential overflow before multiplication
  if (validFactor > 0 && validAmount > 0) {
    const maxAllowedFactor = Number.MAX_SAFE_INTEGER / validAmount;
    if (validFactor > maxAllowedFactor) {
      throw new Error(`Multiplication overflow: ${validAmount} * ${validFactor} would exceed MAX_SAFE_INTEGER`);
    }
  }
  
  // Calculate the result
  const result = validAmount * validFactor;
  
  // Check for overflow after multiplication
  if (!Number.isFinite(result)) {
    throw new Error(`Multiplication overflow: ${validAmount} * ${validFactor} resulted in non-finite value`);
  }
  
  const roundedResult = Math.round(result);
  
  // Final safety check
  if (roundedResult > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Multiplication overflow: result ${roundedResult} exceeds MAX_SAFE_INTEGER`);
  }
  
  // Ensure result is non-negative (since both inputs are non-negative)
  if (roundedResult < 0) {
    throw new Error(`Multiplication resulted in negative value: ${roundedResult}`);
  }
  
  return roundedResult;
}