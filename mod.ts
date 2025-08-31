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
 * @example Basic Usage with Numbers
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
 * // Format results for display
 * const baseAmount = formatCentsWithCurrency(breakdown.baseAmountCents); // "$28,318.58"
 * const taxAmount = formatCentsWithCurrency(breakdown.taxAmountCents);   // "$3,681.42"
 * const total = formatCentsWithCurrency(breakdown.totalAmountCents);     // "$32,000.00"
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
 */
export { calculateTaxFromBase } from './src/calculations.ts';

/**
 * Calculate base amount from total amount including taxes using basis points.
 * 
 * This function implements the core algorithm: base = total / (1 + rate)
 * Where rate = taxBasisPoints / BASIS_POINTS_SCALE
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
 */
export { calculateBaseFromTotal } from './src/calculations.ts';

/**
 * Calculate comprehensive tax breakdown from total amount including taxes.
 * 
 * This function provides a complete breakdown of a total amount into its base and tax components.
 * It ensures exact precision where base + tax = total.
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
 */
export { calculateTaxBreakdown } from './src/calculations.ts';