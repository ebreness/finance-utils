/**
 * Core type definitions for the finance calculations library
 */

/**
 * Union type for inputs that can be either string or number
 * Used to support string inputs that will be converted to numbers
 */
export type StringOrNumber = string | number;

/**
 * Monetary amount represented in cents (integer)
 * Example: $123.45 = 12345 cents
 */
export type AmountCents = number;

/**
 * Tax rate or percentage represented in basis points (integer)
 * 1 basis point = 0.01%
 * Example: 13% = 1300 basis points
 */
export type BasisPoints = number;

/**
 * Decimal amount for display purposes (number with 2 decimal places)
 * Example: 123.45
 */
export type DecimalAmount = number;

/**
 * Result of tax calculation with complete breakdown
 */
export interface TaxCalculationResult {
  /** Base amount before taxes in cents */
  baseAmountCents: AmountCents;
  /** Tax amount in cents */
  taxAmountCents: AmountCents;
  /** Total amount including taxes in cents */
  totalAmountCents: AmountCents;
}

/**
 * Options for formatting monetary amounts and percentages
 */
export interface FormatOptions {
  /** Currency symbol to display (default: '$') */
  currencySymbol?: string;
  /** Locale for number formatting (default: 'en-US') */
  locale?: string;
}