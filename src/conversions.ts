/**
 * Conversion functions for monetary amounts and percentages
 */

import type { AmountCents, BasisPoints, DecimalAmount, StringOrNumber } from './types.ts';
import { CENTS_SCALE, BASIS_POINTS_SCALE, MAX_SAFE_CENTS } from './constants.ts';
import { validateAmountCents, validateBasisPoints, validateNumber, convertToNumber } from './validation.ts';

/**
 * Converts a decimal amount to cents (integer)
 * @param decimalAmount - The decimal amount to convert (e.g., 123.45) - accepts string or number
 * @returns The amount in cents (e.g., 12345)
 * @throws Error if the conversion would cause overflow or precision issues
 */
export function decimalToCents(decimalAmount: StringOrNumber): AmountCents {
  // Convert and validate input
  const validDecimalAmount = convertToNumber(decimalAmount, 'Decimal amount');

  // Check for negative values
  if (validDecimalAmount < 0) {
    throw new Error('Decimal amount cannot be negative');
  }

  // Convert to cents by multiplying by 100 and rounding to handle floating point precision
  const cents = Math.round(validDecimalAmount * CENTS_SCALE);

  // Check for overflow
  if (cents > MAX_SAFE_CENTS) {
    throw new Error(`Converted amount ${cents} cents exceeds maximum safe value ${MAX_SAFE_CENTS}`);
  }

  return cents;
}

/**
 * Converts cents (integer) to a decimal amount with exactly 2 decimal places
 * @param cents - The amount in cents (e.g., 12345)
 * @returns The decimal amount (e.g., 123.45)
 * @throws Error if the input is invalid
 */
export function centsToDecimal(cents: AmountCents): DecimalAmount {
  // Validate input using existing cents validation
  validateAmountCents(cents);

  // Convert to decimal by dividing by 100
  const decimal = cents / CENTS_SCALE;

  // Round to exactly 2 decimal places to handle any floating point precision issues
  return Math.round(decimal * 100) / 100;
}

/**
 * Converts a percentage in 0-100 format to basis points
 * @param percentage - The percentage value (e.g., 13 for 13%) - accepts string or number
 * @returns The value in basis points (e.g., 1300 for 13%)
 * @throws Error if the input is invalid
 */
export function percent100ToBasisPoints(percentage: StringOrNumber): BasisPoints {
  // Convert and validate input
  const validPercentage = convertToNumber(percentage, 'Percentage');

  // Check for negative values
  if (validPercentage < 0) {
    throw new Error('Percentage cannot be negative');
  }

  // Convert percentage (0-100) to basis points by multiplying by 100
  // 13% = 13 * 100 = 1300 basis points
  const basisPoints = Math.round(validPercentage * 100);

  return basisPoints;
}

/**
 * Converts a percentage in 0-1 format to basis points
 * @param percentage - The percentage value (e.g., 0.13 for 13%) - accepts string or number
 * @returns The value in basis points (e.g., 1300 for 13%)
 * @throws Error if the input is invalid
 */
export function percent1ToBasisPoints(percentage: StringOrNumber): BasisPoints {
  // Convert and validate input
  const validPercentage = convertToNumber(percentage, 'Percentage');

  // Check for negative values
  if (validPercentage < 0) {
    throw new Error('Percentage cannot be negative');
  }

  // Convert percentage (0-1) to basis points by multiplying by 10000
  // 0.13 = 0.13 * 10000 = 1300 basis points
  const basisPoints = Math.round(validPercentage * BASIS_POINTS_SCALE);

  return basisPoints;
}

/**
 * Converts basis points to percentage in 0-100 format
 * @param basisPoints - The value in basis points (e.g., 1300 for 13%)
 * @returns The percentage value (e.g., 13 for 13%)
 * @throws Error if the input is invalid
 */
export function basisPointsToPercent100(basisPoints: BasisPoints): number {
  // Validate input using existing basis points validation
  validateBasisPoints(basisPoints);

  // Convert basis points to percentage (0-100) by dividing by 100
  // 1300 basis points = 1300 / 100 = 13%
  return basisPoints / 100;
}

/**
 * Converts basis points to percentage in 0-1 format
 * @param basisPoints - The value in basis points (e.g., 1300 for 13%)
 * @returns The percentage value (e.g., 0.13 for 13%)
 * @throws Error if the input is invalid
 */
export function basisPointsToPercent1(basisPoints: BasisPoints): number {
  // Validate input using existing basis points validation
  validateBasisPoints(basisPoints);

  // Convert basis points to percentage (0-1) by dividing by 10000
  // 1300 basis points = 1300 / 10000 = 0.13
  return basisPoints / BASIS_POINTS_SCALE;
}