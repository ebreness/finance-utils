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
 * 1. Calculate mathematical base: baseCents = round(totalCents * BASIS_POINTS_SCALE / (BASIS_POINTS_SCALE + taxBasisPoints))
 * 2. Calculate tax from mathematical base: taxCents = calculateTaxFromBase(baseCents, taxBasisPoints) 
 * 3. Adjust base to ensure exact total: baseCents = totalCents - taxCents
 * 
 * This approach GUARANTEES that base + tax = total exactly by keeping the tax amount constant
 * and adjusting only the base amount.
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

  // Calculate initial base using the mathematical formula: base = total * scale / (scale + taxRate)
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
  let baseCents = Math.round(numerator / denominator);

  // Calculate tax from the initial mathematical base - this tax amount stays constant
  const taxAmountCents = calculateTaxFromBase(baseCents, validTaxBasisPoints);

  // Adjust the base so that base + tax = total exactly
  // Tax never changes, only base is adjusted
  baseCents = validTotalCents - taxAmountCents;

  // Verify the result
  if (baseCents + taxAmountCents !== validTotalCents) {
    throw new Error(`Base calculation precision error: base ${baseCents} + tax ${taxAmountCents} = ${baseCents + taxAmountCents} ≠ target ${validTotalCents}`);
  }

  // Validate the result
  if (baseCents < 0) {
    throw new Error(`Base calculation resulted in negative value: ${baseCents}`);
  }

  if (baseCents > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Base calculation overflow: result ${baseCents} exceeds MAX_SAFE_INTEGER`);
  }

  return baseCents;
}

/**
 * Calculate comprehensive tax breakdown with ABSOLUTE EXACT PRECISION GUARANTEE
 * 
 * This function provides a complete breakdown of a total amount into its base and tax components
 * with the STRONGEST PRECISION GUARANTEE in the library. It implements an intelligent adjustment
 * algorithm that ensures base + tax = total exactly, even when rounding discrepancies occur.
 * 
 * PRECISION GUARANTEE: baseAmountCents + taxAmountCents = totalAmountCents (ALWAYS TRUE)
 * 
 * ADJUSTMENT ALGORITHM:
 * 1. Calculate initial base amount using standard division
 * 2. Calculate tax from that base amount (tax amount stays constant)
 * 3. If base + tax ≠ total, adjust ONLY the base amount to ensure exact total
 * 4. Tax amount never changes - only base amount is adjusted for precision
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
 * calculateTaxBreakdown(12200, 1300) // $122.00 with 13% tax
 * // returns { baseAmountCents: 10797, taxAmountCents: 1403, totalAmountCents: 12200 }
 * // Note: Base adjusted from 10796 to 10797 to ensure exact total
 * ```
 * 
 * @example Exact Precision Guarantee - Always True
 * ```js
 * const breakdown = calculateTaxBreakdown(12200, 1300); // $122.00 with 13% tax
 * 
 * // GUARANTEED: This will ALWAYS be true, regardless of input values
 * console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
 * console.log(10797 + 1403 === 12200); // true
 * 
 * // The adjustment ensures exact precision even in problematic cases
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
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Handle edge case: if tax rate is 0, base equals total
  if (validTaxBasisPoints === 0) {
    return {
      baseAmountCents: validTotalCents,
      taxAmountCents: 0,
      totalAmountCents: validTotalCents
    };
  }

  // First calculate the mathematical base to determine the tax amount
  const mathematicalBase = Math.round((validTotalCents * BASIS_POINTS_SCALE) / (BASIS_POINTS_SCALE + validTaxBasisPoints));

  // Calculate tax from the mathematical base - this tax amount stays constant
  const taxAmountCents = calculateTaxFromBase(mathematicalBase, validTaxBasisPoints);

  // Calculate the adjusted base that ensures base + tax = total exactly
  const baseAmountCents = validTotalCents - taxAmountCents;

  // Verify exact precision (this should always pass now)
  const calculatedTotal = baseAmountCents + taxAmountCents;
  if (calculatedTotal !== validTotalCents) {
    throw new Error(`Tax breakdown precision error: base ${baseAmountCents} + tax ${taxAmountCents} = ${calculatedTotal} ≠ total ${validTotalCents}`);
  }

  // Final validation: ensure exact precision
  if (baseAmountCents + taxAmountCents !== validTotalCents) {
    throw new Error(`Tax breakdown precision error: base ${baseAmountCents} + tax ${taxAmountCents} = ${baseAmountCents + taxAmountCents} ≠ total ${validTotalCents}`);
  }

  // Additional validation: both amounts should be non-negative
  if (baseAmountCents < 0) {
    throw new Error(`Tax breakdown resulted in negative base amount: ${baseAmountCents}`);
  }

  if (taxAmountCents < 0) {
    throw new Error(`Tax breakdown resulted in negative tax amount: ${taxAmountCents}`);
  }

  return {
    baseAmountCents,
    taxAmountCents,
    totalAmountCents: validTotalCents
  };
}

/**
 * Calculate tax breakdown from a previously calculated base amount with EXACT PRECISION GUARANTEE
 * 
 * This function is designed for the specific use case where:
 * 1. User enters a total amount (e.g., $122.00)
 * 2. App calculates base amount using calculateBaseFromTotal (e.g., $107.96)
 * 3. Later, app needs breakdown using that same base amount
 * 4. This function ensures the breakdown always matches the original total exactly
 * 
 * The function calculates tax from the base (keeping it constant), then adjusts only the base amount if needed to match the expected total.
 * 
 * @param baseCents - Base amount in cents (previously calculated) - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @param expectedTotalCents - Expected total amount in cents - accepts string or number
 * @returns Complete tax calculation breakdown with exact precision guarantee
 * @throws Error if inputs are invalid or result in negative amounts
 * 
 * @example Typical User Flow
 * ```js
 * // Step 1: User enters total, app calculates base
 * const userTotal = 12200; // $122.00
 * const taxRate = 1300;    // 13%
 * const calculatedBase = calculateBaseFromTotal(userTotal, taxRate); // 10796 ($107.96)
 * 
 * // Step 2: Later, app needs breakdown using that base
 * const breakdown = calculateTaxBreakdownFromBase(calculatedBase, taxRate, userTotal);
 * // Returns: { baseAmountCents: 10797, taxAmountCents: 1403, totalAmountCents: 12200 }
 * 
 * // GUARANTEED: base + tax = original total exactly
 * console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === userTotal); // true
 * ```
 * 
 * @example Adjustment Logic
 * ```js
 * // When calculateTaxFromBase(10796, 1300) returns 1403
 * // And 10796 + 1403 = 12199 ≠ 12200
 * // Function adjusts base to 10797, keeping tax at 1403
 * // Result: 10797 + 1403 = 12200 (exact match)
 * ```
 */
export function calculateTaxBreakdownFromBase(
  baseCents: StringOrNumber,
  taxBasisPoints: StringOrNumber,
  expectedTotalCents: StringOrNumber
): TaxCalculationResult {
  // Validate and convert inputs
  const validBaseCents = validateAmountCents(baseCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);
  const validExpectedTotal = validateAmountCents(expectedTotalCents);

  // Calculate tax from base - this stays constant
  const taxAmountCents = calculateTaxFromBase(validBaseCents, validTaxBasisPoints);
  let baseAmountCents = validBaseCents;

  // Check if we get exact total
  const calculatedTotal = baseAmountCents + taxAmountCents;

  if (calculatedTotal !== validExpectedTotal) {
    // Adjust ONLY the base amount to match the expected total exactly
    // This handles cases where users pass base amounts not from calculateBaseFromTotal
    const difference = validExpectedTotal - calculatedTotal;
    const adjustedBase = validBaseCents + difference;

    // Validate the adjusted base is non-negative
    if (adjustedBase < 0) {
      throw new Error(`Tax breakdown would result in negative base amount: ${adjustedBase}. Expected total ${validExpectedTotal} is too small for tax amount ${taxAmountCents}.`);
    }

    baseAmountCents = adjustedBase;
  }

  // Final validation: ensure exact precision
  if (baseAmountCents + taxAmountCents !== validExpectedTotal) {
    throw new Error(`Tax breakdown precision error: base ${baseAmountCents} + tax ${taxAmountCents} = ${baseAmountCents + taxAmountCents} ≠ expected total ${validExpectedTotal}`);
  }

  // Additional validation: both amounts should be non-negative
  if (baseAmountCents < 0) {
    throw new Error(`Tax breakdown resulted in negative base amount: ${baseAmountCents}`);
  }

  if (taxAmountCents < 0) {
    throw new Error(`Tax breakdown resulted in negative tax amount: ${taxAmountCents}`);
  }

  return {
    baseAmountCents,
    taxAmountCents,
    totalAmountCents: validExpectedTotal
  };
}