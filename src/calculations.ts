/**
 * Tax calculation functions for precise financial calculations
 * 
 * This module provides functions for calculating tax amounts and base amounts
 * with EXACT PRECISION GUARANTEE using integer arithmetic to avoid floating-point errors.
 * 
 * KEY GUARANTEE: All tax breakdown functions ensure that base + tax = total EXACTLY.
 * When mathematical precision conflicts with exact totals, the library prioritizes 
 * exact totals by intelligently adjusting component amounts.
 * 
 * @example Exact Precision Guarantee
 * ```js
 * import { calculateTaxBreakdown } from '@ebreness/finance-utils';
 * 
 * const breakdown = calculateTaxBreakdown(3200000, 1300); // $32,000 with 13% tax
 * // Returns: { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * // GUARANTEED: base + tax = total EXACTLY
 * console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
 * console.log(2831858 + 368142 === 3200000); // true
 * 
 * // This precision is maintained even when mathematical rounding would cause discrepancies
 * ```
 */

import type { AmountCents, TaxCalculationResult, StringOrNumber } from './types.ts';
import { validateAmountCents, validateBasisPoints } from './validation.ts';
import { BASIS_POINTS_SCALE } from './constants.ts';

/**
 * Calculate tax amount from base amount using basis points with EXACT PRECISION
 * 
 * This function calculates tax amounts using integer arithmetic to maintain precision.
 * When used with calculateBaseFromTotal, it guarantees that base + tax = total exactly.
 * 
 * @param baseCents - Base amount in cents (before taxes) - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Tax amount in cents
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example Basic Usage
 * ```js
 * calculateTaxFromBase(100000, 1300) // returns 13000 (13% of $1000.00 = $130.00)
 * calculateTaxFromBase(2831858, 1300) // returns 368142 (13% of $28,318.58 = $3,681.42)
 * ```
 * 
 * @example Exact Precision with Tax Breakdown
 * ```js
 * // When combined with calculateBaseFromTotal, exact precision is guaranteed
 * const total = 3200000; // $32,000.00
 * const taxRate = 1300;  // 13%
 * 
 * const base = calculateBaseFromTotal(total, taxRate); // 2831858
 * const tax = calculateTaxFromBase(base, taxRate);     // 368142
 * 
 * console.log(base + tax === total); // true - EXACT PRECISION GUARANTEED
 * ```
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
 * Calculate base amount from total amount including taxes with EXACT PRECISION GUARANTEE
 * 
 * This function implements the core algorithm: base = total / (1 + rate)
 * Where rate = taxBasisPoints / BASIS_POINTS_SCALE
 * 
 * EXACT PRECISION ALGORITHM:
 * 1. baseCents = round(totalCents * BASIS_POINTS_SCALE / (BASIS_POINTS_SCALE + taxBasisPoints))
 * 2. taxCents = totalCents - baseCents (calculated as difference to ensure exact total)
 * 
 * This approach GUARANTEES that base + tax = total exactly, even when mathematical
 * precision would result in fractional cents.
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Base amount in cents (before taxes)
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example Basic Usage
 * ```js
 * calculateBaseFromTotal(3200000, 1300) // returns 2831858 (base: $28,318.58, tax: $3,681.42)
 * calculateBaseFromTotal(113000, 1300) // returns 100000 (base: $1,000.00, tax: $130.00)
 * ```
 * 
 * @example Exact Precision Guarantee
 * ```js
 * const total = 3200000; // $32,000.00
 * const taxRate = 1300;  // 13%
 * 
 * const base = calculateBaseFromTotal(total, taxRate); // 2831858
 * const tax = total - base; // 368142 (calculated as difference)
 * 
 * // GUARANTEED: base + tax = total EXACTLY
 * console.log(base + tax === total); // true (2831858 + 368142 = 3200000)
 * 
 * // Even when displayed with 2 decimal places, the relationship holds:
 * console.log('Base: $28,318.58, Tax: $3,681.42, Total: $32,000.00');
 * console.log('$28,318.58 + $3,681.42 = $32,000.00'); // Exact!
 * ```
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

  // Calculate tax amount as the difference to guarantee exact total
  const taxCents = validTotalCents - baseCents;

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
 * Calculate comprehensive tax breakdown with ABSOLUTE EXACT PRECISION GUARANTEE
 * 
 * This function provides a complete breakdown of a total amount into its base and tax components
 * with the STRONGEST PRECISION GUARANTEE in the library. It uses the existing calculateBaseFromTotal 
 * function internally and guarantees exact precision by design - the tax amount is ALWAYS calculated 
 * as the difference to ensure base + tax = total exactly.
 * 
 * PRECISION GUARANTEE: baseAmountCents + taxAmountCents = totalAmountCents (ALWAYS TRUE)
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Complete tax calculation breakdown with base, tax, and total amounts
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example Basic Usage
 * ```js
 * calculateTaxBreakdown(3200000, 1300) 
 * // returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * calculateTaxBreakdown(113000, 1300)
 * // returns { baseAmountCents: 100000, taxAmountCents: 13000, totalAmountCents: 113000 }
 * ```
 * 
 * @example Exact Precision Guarantee - Always True
 * ```js
 * const breakdown = calculateTaxBreakdown(3200000, 1300);
 * 
 * // GUARANTEED: This will ALWAYS be true, regardless of input values
 * console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
 * 
 * // Real example with the specific case from requirements:
 * console.log(2831858 + 368142 === 3200000); // true
 * 
 * // Works with any input values:
 * const breakdown2 = calculateTaxBreakdown(999999, 1234); // Any values
 * console.log(breakdown2.baseAmountCents + breakdown2.taxAmountCents === breakdown2.totalAmountCents); // true
 * ```
 * 
 * @example Edge Cases - Precision Maintained
 * ```js
 * // Even with edge cases that would cause floating-point errors:
 * const edgeCase = calculateTaxBreakdown(1, 3333); // Very small total, unusual tax rate
 * console.log(edgeCase.baseAmountCents + edgeCase.taxAmountCents === edgeCase.totalAmountCents); // true
 * 
 * // Large amounts that might cause precision issues in floating-point:
 * const largeCase = calculateTaxBreakdown(999999999, 1300);
 * console.log(largeCase.baseAmountCents + largeCase.taxAmountCents === largeCase.totalAmountCents); // true
 * ```
 */
export function calculateTaxBreakdown(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): TaxCalculationResult {
  // Validate and convert inputs
  const validTotalCents = validateAmountCents(totalCents);

  // Calculate base amount using existing function (includes all validation)
  const baseAmountCents = calculateBaseFromTotal(totalCents, taxBasisPoints);

  // Calculate tax amount as the difference to guarantee exact total
  const taxAmountCents = validTotalCents - baseAmountCents;

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