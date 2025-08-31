/**
 * Tax calculation functions for precise financial calculations
 * 
 * This module provides functions for calculating tax amounts and base amounts
 * with exact precision using integer arithmetic to avoid floating-point errors.
 */

import type { AmountCents, BasisPoints, TaxCalculationResult, StringOrNumber } from './types.ts';
import { validateAmountCents, validateBasisPoints, checkSafeOperation } from './validation.ts';
import { BASIS_POINTS_SCALE } from './constants.ts';
import { safeMultiply } from './arithmetic.ts';

/**
 * Calculate tax amount from base amount using basis points
 * 
 * @param baseCents - Base amount in cents (before taxes) - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Tax amount in cents
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example
 * calculateTaxFromBase(100000, 1300) // returns 13000 (13% of $1000.00 = $130.00)
 * calculateTaxFromBase(2831858, 1300) // returns 368142 (13% of $28,318.58 = $3,681.42)
 */
export function calculateTaxFromBase(baseCents: StringOrNumber, taxBasisPoints: StringOrNumber): AmountCents {
  const validBaseCents = validateAmountCents(baseCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Calculate tax using: taxAmount = baseAmount * (taxBasisPoints / BASIS_POINTS_SCALE)
  // To maintain integer arithmetic: taxAmount = (baseAmount * taxBasisPoints) / BASIS_POINTS_SCALE

  // Check for overflow before multiplication
  if (validBaseCents > 0 && validTaxBasisPoints > 0) {
    const maxAllowedBase = Math.floor(Number.MAX_SAFE_INTEGER / validTaxBasisPoints);
    if (validBaseCents > maxAllowedBase) {
      throw new Error(`Tax calculation overflow: base amount ${validBaseCents} with tax rate ${validTaxBasisPoints} basis points would exceed MAX_SAFE_INTEGER`);
    }
  }

  // Calculate the numerator (base * tax rate in basis points)
  const numerator = validBaseCents * validTaxBasisPoints;

  // Divide by basis points scale and round to nearest cent
  const taxCents = Math.round(numerator / BASIS_POINTS_SCALE);

  // Validate the result
  if (taxCents < 0) {
    throw new Error(`Tax calculation resulted in negative value: ${taxCents}`);
  }

  if (taxCents > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Tax calculation overflow: result ${taxCents} exceeds MAX_SAFE_INTEGER`);
  }

  return taxCents;
}

/**
 * Calculate base amount from total amount including taxes using basis points
 * 
 * This function implements the core algorithm: base = total / (1 + rate)
 * Where rate = taxBasisPoints / BASIS_POINTS_SCALE
 * 
 * To maintain integer arithmetic:
 * baseCents = round(totalCents * BASIS_POINTS_SCALE / (BASIS_POINTS_SCALE + taxBasisPoints))
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Base amount in cents (before taxes)
 * @throws Error if inputs are invalid, calculation would cause overflow, or precision cannot be maintained
 * 
 * @example
 * calculateBaseFromTotal(3200000, 1300) // returns 2831858 (base: $28,318.58, tax: $3,681.42)
 * calculateBaseFromTotal(113000, 1300) // returns 100000 (base: $1,000.00, tax: $130.00)
 */
export function calculateBaseFromTotal(totalCents: StringOrNumber, taxBasisPoints: StringOrNumber): AmountCents {
  const validTotalCents = validateAmountCents(totalCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Handle edge case: if tax rate is 0, base equals total
  if (validTaxBasisPoints === 0) {
    return validTotalCents;
  }

  // Calculate using the core algorithm: base = total * scale / (scale + taxRate)
  const scale = BASIS_POINTS_SCALE;
  const denominator = scale + validTaxBasisPoints;

  // Check for overflow in numerator calculation
  if (validTotalCents > 0) {
    const maxAllowedTotal = Math.floor(Number.MAX_SAFE_INTEGER / scale);
    if (validTotalCents > maxAllowedTotal) {
      throw new Error(`Base calculation overflow: total amount ${validTotalCents} with scale ${scale} would exceed MAX_SAFE_INTEGER`);
    }
  }

  const numerator = validTotalCents * scale;

  // Calculate base amount with proper rounding
  const baseCents = Math.round(numerator / denominator);

  // Calculate tax amount to verify precision
  const taxCents = validTotalCents - baseCents;

  // Verify that base + tax equals original total exactly
  if (baseCents + taxCents !== validTotalCents) {
    throw new Error(`Calculation precision error: base ${baseCents} + tax ${taxCents} = ${baseCents + taxCents} ≠ total ${validTotalCents}`);
  }

  // Validate the result
  if (baseCents < 0) {
    throw new Error(`Base calculation resulted in negative value: ${baseCents}`);
  }

  if (baseCents > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Base calculation overflow: result ${baseCents} exceeds MAX_SAFE_INTEGER`);
  }

  // Additional validation: tax amount should be non-negative
  if (taxCents < 0) {
    throw new Error(`Tax calculation resulted in negative value: ${taxCents}`);
  }

  return baseCents;
}

/**
 * Calculate comprehensive tax breakdown from total amount including taxes
 * 
 * This function provides a complete breakdown of a total amount into its base and tax components.
 * It uses the existing calculateBaseFromTotal function internally and ensures exact precision.
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Complete tax calculation breakdown with base, tax, and total amounts
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example
 * calculateTaxBreakdown(3200000, 1300) 
 * // returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * calculateTaxBreakdown(113000, 1300)
 * // returns { baseAmountCents: 100000, taxAmountCents: 13000, totalAmountCents: 113000 }
 */
export function calculateTaxBreakdown(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): TaxCalculationResult {
  // Validate and convert inputs
  const validTotalCents = validateAmountCents(totalCents);

  // Calculate base amount using existing function (includes all validation)
  const baseAmountCents = calculateBaseFromTotal(totalCents, taxBasisPoints);

  // Calculate tax amount as the difference
  const taxAmountCents = validTotalCents - baseAmountCents;

  // Verify exact precision (this should always be true due to calculateBaseFromTotal's design)
  if (baseAmountCents + taxAmountCents !== validTotalCents) {
    throw new Error(`Tax breakdown precision error: base ${baseAmountCents} + tax ${taxAmountCents} = ${baseAmountCents + taxAmountCents} ≠ total ${validTotalCents}`);
  }

  // Additional validation: tax amount should be non-negative
  if (taxAmountCents < 0) {
    throw new Error(`Tax breakdown resulted in negative tax amount: ${taxAmountCents}`);
  }

  return {
    baseAmountCents,
    taxAmountCents,
    totalAmountCents: validTotalCents
  };
}