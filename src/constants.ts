/**
 * Mathematical constants and default values for finance calculations
 */

/** Scale factor for converting dollars to cents (1 dollar = 100 cents) */
export const CENTS_SCALE = 100;

/** Scale factor for basis points (1 = 10000 basis points, 1 bp = 0.01%) */
export const BASIS_POINTS_SCALE = 10000;

/** 
 * Maximum safe amount in cents to prevent integer overflow
 * Calculated as Math.floor(Number.MAX_SAFE_INTEGER / BASIS_POINTS_SCALE)
 */
export const MAX_SAFE_CENTS = Math.floor(Number.MAX_SAFE_INTEGER / BASIS_POINTS_SCALE);

/** Default locale for number formatting */
export const DEFAULT_LOCALE = 'en-US';

/** Default currency symbol */
export const DEFAULT_CURRENCY_SYMBOL = '$';

/** Maximum safe integer value for JavaScript */
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;