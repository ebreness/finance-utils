/**
 * @module
 * A precision-focused TypeScript utility library for financial calculations and formatting.
 * 
 * This library solves floating-point precision issues in financial calculations by working
 * with integer cents and basis points internally, only rounding at the final display step.
 * 
 * Key features:
 * - Exact monetary calculations using integer arithmetic
 * - Tax calculations with precise base/total amount relationships
 * - Currency and percentage formatting utilities
 * - Comprehensive input validation and overflow protection
 * - TypeScript support with strict type definitions
 * - String input support for seamless integration with forms and APIs
 * 
 * @example Basic Usage with EXACT PRECISION GUARANTEE
 * ```js
 * import { 
 *   calculateTaxBreakdown, 
 *   decimalToCents, 
 *   centsToDecimal,
 *   formatCentsWithCurrency 
 * } from '@ebreness/finance-utils';
 * 
 * // Convert $32,000.00 to cents
 * const totalCents = decimalToCents(32000.00); // 3200000
 * 
 * // Calculate tax breakdown (13% tax rate = 1300 basis points)
 * const breakdown = calculateTaxBreakdown(totalCents, 1300);
 * // Returns: { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * // GUARANTEED: base + tax = total EXACTLY
 * console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
 * console.log(2831858 + 368142 === 3200000); // true - exact precision!
 * 
 * // Format results for display
 * const baseAmount = formatCentsWithCurrency(breakdown.baseAmountCents); // "$28,318.58"
 * const taxAmount = formatCentsWithCurrency(breakdown.taxAmountCents);   // "$3,681.42"
 * const total = formatCentsWithCurrency(breakdown.totalAmountCents);     // "$32,000.00"
 * 
 * // Even formatted amounts maintain the relationship: $28,318.58 + $3,681.42 = $32,000.00
 * ```
 * 
 * @example String Input Support
 * ```js
 * import { 
 *   calculateTaxBreakdown, 
 *   decimalToCents, 
 *   calculateBaseFromTotal,
 *   percent100ToBasisPoints,
 *   formatCentsWithCurrency 
 * } from '@ebreness/finance-utils';
 * 
 * // All functions accept string inputs - perfect for form data and API responses
 * const totalCents = decimalToCents("32000.00"); // 3200000
 * const taxRate = percent100ToBasisPoints("13"); // 1300
 * 
 * // Calculate with string inputs
 * const breakdown = calculateTaxBreakdown("3200000", "1300");
 * // Returns: { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * // Mix string and number inputs as needed
 * const baseCents = calculateBaseFromTotal("113000", 1300); // 100000
 * 
 * // Format with string inputs - no manual conversion needed!
 * const formatted = formatCentsWithCurrency("12345"); // "$123.45"
 * const formattedWithWhitespace = formatCentsWithCurrency("  12345  "); // "$123.45"
 * 
 * // Handles whitespace automatically
 * const cleanedCents = decimalToCents("  123.45  "); // 12345
 * ```
 * 
 * @example Tax Calculations
 * ```js
 * import { calculateTaxFromBase, calculateBaseFromTotal } from '@ebreness/finance-utils';
 * 
 * // Calculate tax on $1,000.00 at 13% rate (using numbers)
 * const baseCents = 100000; // $1,000.00
 * const taxRate = 1300;     // 13% in basis points
 * const taxCents = calculateTaxFromBase(baseCents, taxRate); // 13000 ($130.00)
 * 
 * // Calculate base amount from total including taxes (using strings)
 * const totalCents = "113000"; // $1,130.00 from form input
 * const calculatedBase = calculateBaseFromTotal(totalCents, "1300"); // 100000 ($1,000.00)
 * ```
 * 
 * @example Conversions and Formatting
 * ```js
 * import { 
 *   decimalToCents, 
 *   centsToDecimal,
 *   percent100ToBasisPoints,
 *   formatPercentWithSymbol,
 *   formatCentsWithCurrency 
 * } from '@ebreness/finance-utils';
 * 
 * // Convert between decimal and cents (string inputs supported)
 * const cents = decimalToCents("123.45");    // 12345
 * const decimal = centsToDecimal(12345);     // 123.45
 * 
 * // Convert percentage to basis points (string inputs supported)
 * const basisPoints = percent100ToBasisPoints("13"); // 1300 (13% = 1300 basis points)
 * 
 * // Format percentage for display
 * const formatted = formatPercentWithSymbol(1300); // "13.00%"
 * 
 * // Format currency with string inputs (no conversion needed!)
 * const currencyFormatted = formatCentsWithCurrency("12345"); // "$123.45"
 * ```
 * 
 * @example Real-World Usage (Form Data & APIs)
 * ```js
 * import { 
 *   calculateTaxFromBase, 
 *   formatCentsWithCurrency 
 * } from '@ebreness/finance-utils';
 * 
 * // Example: Processing form data or API responses
 * function processOrderData(params) {
 *   // No manual string conversion needed - functions accept strings directly!
 *   const taxes = calculateTaxFromBase(params.contactCostInCents, params.taxesInBasisPoints);
 *   
 *   return {
 *     formattedCatalogCost: formatCentsWithCurrency(params.catalogCostInCents),
 *     formattedContactCost: formatCentsWithCurrency(params.contactCostInCents),
 *     formattedTaxesAmount: formatCentsWithCurrency(taxes),
 *     formattedTotal: formatCentsWithCurrency(
 *       Number(params.contactCostInCents) + taxes
 *     ),
 *   };
 * }
 * 
 * // Usage with string data from forms/APIs
 * const result = processOrderData({
 *   catalogCostInCents: "90000",      // $900.00
 *   contactCostInCents: "100000",     // $1,000.00
 *   taxesInBasisPoints: "1300"        // 13%
 * });
 * // Returns formatted currency strings ready for display
 * ```
 * 
 * @example Edge Cases - Exact Precision Maintained
 * ```js
 * import { calculateTaxBreakdown, formatCentsWithCurrency } from '@ebreness/finance-utils';
 * 
 * // Very small amounts that would cause floating-point issues
 * const tiny = calculateTaxBreakdown(1, 3333); // $0.01 with 33.33% tax
 * console.log(tiny.baseAmountCents + tiny.taxAmountCents === 1); // true - exact!
 * 
 * // High tax rates
 * const highTax = calculateTaxBreakdown(300, 5000); // $3.00 with 50% tax
 * console.log(highTax.baseAmountCents + highTax.taxAmountCents === 300); // true
 * console.log(highTax.baseAmountCents); // 200 ($2.00 base)
 * console.log(highTax.taxAmountCents);  // 100 ($1.00 tax)
 * 
 * // Large amounts that might cause precision issues
 * const large = calculateTaxBreakdown(999999999, 1300);
 * console.log(large.baseAmountCents + large.taxAmountCents === 999999999); // true
 * 
 * // Zero tax rate
 * const noTax = calculateTaxBreakdown(100000, 0); // $1,000 with 0% tax
 * console.log(noTax.baseAmountCents === 100000); // true (base = total)
 * console.log(noTax.taxAmountCents === 0); // true (no tax)
 * console.log(noTax.baseAmountCents + noTax.taxAmountCents === 100000); // true
 * ```
 */

// Export all types and interfaces
export type {
  AmountCents,
  BasisPoints,
  DecimalAmount,
  TaxCalculationResult,
  FormatOptions,
  StringOrNumber,
} from './src/types.ts';

// Export constants
export {
  CENTS_SCALE,
  BASIS_POINTS_SCALE,
  MAX_SAFE_CENTS,
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY_SYMBOL,
  MAX_SAFE_INTEGER,
} from './src/constants.ts';

// Export validation functions
export {
  validateAmountCents,
  validateBasisPoints,
  checkSafeOperation,
  validateNumber,
  validateIntegerForFormatting,
  validateNumberForFormatting,
  convertToNumber,
  convertToAmountCents,
  convertToBasisPoints,
} from './src/validation.ts';

// Export conversion functions
export {
  decimalToCents,
  centsToDecimal,
  percent100ToBasisPoints,
  percent1ToBasisPoints,
  basisPointsToPercent100,
  basisPointsToPercent1,
} from './src/conversions.ts';

// Export formatting functions
export {
  formatCentsToNumber,
  formatPercentToNumber,
  formatCentsWithCurrency,
  formatPercentWithSymbol,
  clampPercent01,
  clampPercent0100,
} from './src/format.ts';

// Export arithmetic functions
export {
  safeAdd,
  safeSubtract,
  safeMultiply,
} from './src/arithmetic.ts';

/**
 * Calculate tax amount from base amount using basis points.
 * 
 * @param baseCents - Base amount in cents (before taxes) - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Tax amount in cents
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example Number inputs
 * ```js
 * import { calculateTaxFromBase } from '@ebreness/finance-utils';
 * 
 * calculateTaxFromBase(100000, 1300); // returns 13000 (13% of $1000.00 = $130.00)
 * calculateTaxFromBase(2831858, 1300); // returns 368142 (13% of $28,318.58 = $3,681.42)
 * ```
 * 
 * @example String inputs (Perfect for forms and APIs)
 * ```js
 * import { calculateTaxFromBase } from '@ebreness/finance-utils';
 * 
 * // Perfect for form data and API responses - no manual conversion needed!
 * calculateTaxFromBase("100000", "1300"); // returns 13000
 * calculateTaxFromBase("2831858", "1300"); // returns 368142
 * 
 * // Mix string and number inputs freely
 * calculateTaxFromBase("100000", 1300); // returns 13000
 * 
 * // Handles whitespace automatically
 * calculateTaxFromBase("  100000  ", " 1300 "); // returns 13000
 * ```
 * 
 * @example Exact Precision with Tax Breakdown
 * ```js
 * import { calculateTaxFromBase, calculateBaseFromTotal } from '@ebreness/finance-utils';
 * 
 * // When combined with calculateBaseFromTotal, exact precision is guaranteed
 * const total = 3200000; // $32,000.00
 * const taxRate = 1300;  // 13%
 * 
 * const base = calculateBaseFromTotal(total, taxRate); // 2831858
 * const tax = calculateTaxFromBase(base, taxRate);     // 368142
 * 
 * // GUARANTEED: base + tax = total EXACTLY
 * console.log(base + tax === total); // true - EXACT PRECISION GUARANTEED
 * console.log(2831858 + 368142 === 3200000); // true - real example
 * ```
 */
export { calculateTaxFromBase } from './src/calculations.ts';

/**
 * Calculate base amount from total amount including taxes with EXACT PRECISION GUARANTEE.
 * 
 * This function implements the core algorithm: base = total / (1 + rate)
 * Where rate = taxBasisPoints / BASIS_POINTS_SCALE
 * 
 * PRECISION GUARANTEE: When tax is calculated as (total - base), the result will always
 * satisfy: base + tax = total exactly.
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Base amount in cents (before taxes)
 * @throws Error if inputs are invalid, calculation would cause overflow, or precision cannot be maintained
 * 
 * @example Number inputs
 * ```js
 * import { calculateBaseFromTotal } from '@ebreness/finance-utils';
 * 
 * calculateBaseFromTotal(3200000, 1300); // returns 2831858 (base: $28,318.58, tax: $3,681.42)
 * calculateBaseFromTotal(113000, 1300); // returns 100000 (base: $1,000.00, tax: $130.00)
 * ```
 * 
 * @example String inputs (Perfect for forms and APIs)
 * ```js
 * import { calculateBaseFromTotal } from '@ebreness/finance-utils';
 * 
 * // Perfect for form data and API responses - no manual conversion needed!
 * calculateBaseFromTotal("3200000", "1300"); // returns 2831858
 * calculateBaseFromTotal("113000", "1300"); // returns 100000
 * 
 * // Mix string and number inputs freely
 * calculateBaseFromTotal("3200000", 1300); // returns 2831858
 * 
 * // Handles whitespace automatically
 * calculateBaseFromTotal("  113000  ", " 1300 "); // returns 100000
 * ```
 * 
 * @example Exact Precision Guarantee
 * ```js
 * import { calculateBaseFromTotal } from '@ebreness/finance-utils';
 * 
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
export { calculateBaseFromTotal } from './src/calculations.ts';

/**
 * Calculate comprehensive tax breakdown with ABSOLUTE EXACT PRECISION GUARANTEE.
 * 
 * This function provides a complete breakdown of a total amount into its base and tax components
 * with the STRONGEST PRECISION GUARANTEE in the library. 
 * 
 * PRECISION GUARANTEE: baseAmountCents + taxAmountCents = totalAmountCents (ALWAYS TRUE)
 * 
 * @param totalCents - Total amount including taxes in cents - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @returns Complete tax calculation breakdown with base, tax, and total amounts
 * @throws Error if inputs are invalid or calculation would cause overflow
 * 
 * @example Number inputs
 * ```js
 * import { calculateTaxBreakdown } from '@ebreness/finance-utils';
 * 
 * calculateTaxBreakdown(3200000, 1300);
 * // returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * calculateTaxBreakdown(113000, 1300);
 * // returns { baseAmountCents: 100000, taxAmountCents: 13000, totalAmountCents: 113000 }
 * ```
 * 
 * @example String inputs (Perfect for forms and APIs)
 * ```js
 * import { calculateTaxBreakdown } from '@ebreness/finance-utils';
 * 
 * // Perfect for form data and API responses - no manual conversion needed!
 * calculateTaxBreakdown("3200000", "1300");
 * // returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * 
 * // Mix string and number inputs freely
 * calculateTaxBreakdown("113000", 1300);
 * // returns { baseAmountCents: 100000, taxAmountCents: 13000, totalAmountCents: 113000 }
 * 
 * // Handles whitespace automatically
 * calculateTaxBreakdown("  3200000  ", " 1300 ");
 * // returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }
 * ```
 * 
 * @example Exact Precision Guarantee - Always True
 * ```js
 * import { calculateTaxBreakdown } from '@ebreness/finance-utils';
 * 
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
 * 
 * // Even with edge cases that would cause floating-point errors:
 * const edgeCase = calculateTaxBreakdown(1, 3333); // Very small total, unusual tax rate
 * console.log(edgeCase.baseAmountCents + edgeCase.taxAmountCents === edgeCase.totalAmountCents); // true
 * ```
 */
export { calculateTaxBreakdown } from './src/calculations.ts';

/**
 * Calculate tax breakdown from a previously calculated base amount with EXACT PRECISION GUARANTEE.
 * 
 * This function is designed for the specific use case where:
 * 1. User enters a total amount (e.g., $122.00)
 * 2. App calculates base amount using calculateBaseFromTotal (e.g., $107.96)
 * 3. Later, app needs breakdown using that same base amount
 * 4. This function ensures the breakdown always matches the original total exactly
 * 
 * PRECISION GUARANTEE: baseAmountCents + taxAmountCents = expectedTotalCents (ALWAYS TRUE)
 * 
 * @param baseCents - Base amount in cents (previously calculated) - accepts string or number
 * @param taxBasisPoints - Tax rate in basis points (1300 = 13%) - accepts string or number
 * @param expectedTotalCents - Expected total amount in cents - accepts string or number
 * @returns Complete tax calculation breakdown with exact precision guarantee
 * @throws Error if inputs are invalid or result in negative amounts
 * 
 * @example Typical User Flow
 * ```js
 * import { calculateBaseFromTotal, calculateTaxBreakdownFromBase } from '@ebreness/finance-utils';
 * 
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
 * @example String inputs (Perfect for forms and APIs)
 * ```js
 * import { calculateTaxBreakdownFromBase } from '@ebreness/finance-utils';
 * 
 * // Perfect for form data and API responses - no manual conversion needed!
 * const breakdown = calculateTaxBreakdownFromBase("10796", "1300", "12200");
 * // Returns: { baseAmountCents: 10797, taxAmountCents: 1403, totalAmountCents: 12200 }
 * 
 * // Mix string and number inputs freely
 * const breakdown2 = calculateTaxBreakdownFromBase(10796, "1300", 12200);
 * 
 * // Handles whitespace automatically
 * const breakdown3 = calculateTaxBreakdownFromBase("  10796  ", " 1300 ", "  12200  ");
 * ```
 */
export { calculateTaxBreakdownFromBase } from './src/calculations.ts';