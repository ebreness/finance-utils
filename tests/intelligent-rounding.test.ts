/**
 * Tests for intelligent rounding functionality
 */

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatCentsToNumber, formatPercentToNumber, formatPercentWithSymbol, formatCentsWithCurrency } from '../src/format.ts';

// Test roundHalfUp algorithm through formatPercentToNumber
Deno.test('roundHalfUp algorithm - positive numbers', () => {
  // 0.5 should round up to 1
  assertEquals(formatPercentToNumber(0.5), 0.5); // No rounding needed
  assertEquals(formatPercentToNumber(0.125), 0.13); // 0.125 rounds up to 0.13
  assertEquals(formatPercentToNumber(0.135), 0.14); // 0.135 rounds up to 0.14
  assertEquals(formatPercentToNumber(1.235), 1.24); // 1.235 rounds up to 1.24
  assertEquals(formatPercentToNumber(2.345), 2.35); // 2.345 rounds up to 2.35
});

Deno.test('roundHalfUp algorithm - negative numbers', () => {
  // Round half up means round away from zero for .5 cases
  assertEquals(formatPercentToNumber(-0.125), -0.13); // -0.125 rounds away from zero to -0.13
  assertEquals(formatPercentToNumber(-0.135), -0.14); // -0.135 rounds away from zero to -0.14
  assertEquals(formatPercentToNumber(-1.235), -1.24); // -1.235 rounds away from zero to -1.24
  assertEquals(formatPercentToNumber(-2.345), -2.35); // -2.345 rounds away from zero to -2.35
});

Deno.test('roundHalfUp algorithm - edge cases', () => {
  assertEquals(formatPercentToNumber(0.005), 0.01); // 0.005 rounds away from zero to 0.01
  assertEquals(formatPercentToNumber(-0.005), -0.01); // -0.005 rounds away from zero to -0.01
  assertEquals(formatPercentToNumber(99.995), 100.00); // 99.995 rounds away from zero to 100.00
  assertEquals(formatPercentToNumber(-99.995), -100.00); // -99.995 rounds away from zero to -100.00
});

// Test intelligent adjustment for formatCentsToNumber
Deno.test('intelligent adjustment - 99 cents to next dollar', () => {
  // 121.99 → 122.00
  assertEquals(formatCentsToNumber(12199), 122.00);
  // 56.99 → 57.00
  assertEquals(formatCentsToNumber(5699), 57.00);
  // 999.99 → 1000.00
  assertEquals(formatCentsToNumber(99999), 1000.00);
  // 1.99 → 2.00 (minimum threshold for adjustment)
  assertEquals(formatCentsToNumber(199), 2.00);
});

Deno.test('intelligent adjustment - 01 cents to previous dollar', () => {
  // 122.01 → 122.00
  assertEquals(formatCentsToNumber(12201), 122.00);
  // 57.01 → 57.00
  assertEquals(formatCentsToNumber(5701), 57.00);
  // 1000.01 → 1000.00
  assertEquals(formatCentsToNumber(100001), 1000.00);
  // 2.01 → 2.00 (minimum threshold for adjustment)
  assertEquals(formatCentsToNumber(201), 2.00);
});

Deno.test('intelligent adjustment - 49 cents to 50 cents', () => {
  // 56.49 → 56.50
  assertEquals(formatCentsToNumber(5649), 56.50);
  // 123.49 → 123.50
  assertEquals(formatCentsToNumber(12349), 123.50);
  // 0.49 → 0.50
  assertEquals(formatCentsToNumber(49), 0.50);
  // 999.49 → 999.50
  assertEquals(formatCentsToNumber(99949), 999.50);
});

Deno.test('intelligent adjustment - no change for other values', () => {
  // Values that should not be adjusted
  assertEquals(formatCentsToNumber(12345), 123.45); // 123.45 stays 123.45
  assertEquals(formatCentsToNumber(5650), 56.50); // 56.50 stays 56.50
  assertEquals(formatCentsToNumber(12200), 122.00); // 122.00 stays 122.00
  assertEquals(formatCentsToNumber(5698), 56.98); // 56.98 stays 56.98
  assertEquals(formatCentsToNumber(5702), 57.02); // 57.02 stays 57.02
  assertEquals(formatCentsToNumber(5648), 56.48); // 56.48 stays 56.48
  assertEquals(formatCentsToNumber(5651), 56.51); // 56.51 stays 56.51
});

Deno.test('intelligent adjustment - negative amounts', () => {
  // Negative amounts should also be adjusted
  assertEquals(formatCentsToNumber(-12199), -122.00); // -121.99 → -122.00
  assertEquals(formatCentsToNumber(-12201), -122.00); // -122.01 → -122.00
  assertEquals(formatCentsToNumber(-5649), -56.50); // -56.49 → -56.50
  assertEquals(formatCentsToNumber(-12345), -123.45); // -123.45 stays -123.45
});

Deno.test('intelligent adjustment - edge cases', () => {
  // Test edge cases around the adjustment thresholds
  assertEquals(formatCentsToNumber(1), 0.01); // 0.01 stays 0.01 (not adjusted)
  assertEquals(formatCentsToNumber(99), 0.99); // 0.99 stays 0.99 (too small to adjust)
  assertEquals(formatCentsToNumber(199), 2.00); // 1.99 → 2.00 (adjusted)
  assertEquals(formatCentsToNumber(201), 2.00); // 2.01 → 2.00 (adjusted)
  assertEquals(formatCentsToNumber(101), 1.01); // 1.01 stays 1.01 (too small to adjust)
  assertEquals(formatCentsToNumber(49), 0.50); // 0.49 → 0.50
  assertEquals(formatCentsToNumber(50), 0.50); // 0.50 stays 0.50
  assertEquals(formatCentsToNumber(51), 0.51); // 0.51 stays 0.51
});

// Test formatPercentWithSymbol uses round half up
Deno.test('formatPercentWithSymbol - round half up behavior', () => {
  assertEquals(formatPercentWithSymbol(0.125), '0.13%'); // 0.125 rounds away from zero to 0.13
  assertEquals(formatPercentWithSymbol(0.135), '0.14%'); // 0.135 rounds away from zero to 0.14
  assertEquals(formatPercentWithSymbol(1.235), '1.24%'); // 1.235 rounds away from zero to 1.24
  assertEquals(formatPercentWithSymbol(-0.125), '-0.13%'); // -0.125 rounds away from zero to -0.13
  assertEquals(formatPercentWithSymbol(-0.135), '-0.14%'); // -0.135 rounds away from zero to -0.14
});

// Test string inputs work with intelligent rounding
Deno.test('intelligent rounding - string inputs', () => {
  assertEquals(formatCentsToNumber('12199'), 122.00); // "121.99" → 122.00
  assertEquals(formatCentsToNumber('12201'), 122.00); // "122.01" → 122.00
  assertEquals(formatCentsToNumber('5649'), 56.50); // "56.49" → 56.50
  assertEquals(formatCentsToNumber('12345'), 123.45); // "123.45" stays 123.45
});

// Test complex scenarios with multiple adjustments
Deno.test('intelligent rounding - complex scenarios', () => {
  // Real-world tax calculation scenarios
  // Base: $283.18, Tax: 13%, Total: $319.99 (after intelligent adjustment from $319.9934)
  const baseInCents = 28318;
  const totalAfterTax = Math.round(baseInCents * 1.13); // 31999.34 → 31999 cents
  assertEquals(formatCentsToNumber(totalAfterTax + 99), 320.98); // 320.98 stays as is
  
  // Test that 99 cent adjustments work at different scales
  assertEquals(formatCentsToNumber(31999), 320.00); // 319.99 → 320.00
  assertEquals(formatCentsToNumber(319999), 3200.00); // 3199.99 → 3200.00
  assertEquals(formatCentsToNumber(3199999), 32000.00); // 31999.99 → 32000.00
});

// Test precision maintenance through the rounding process
Deno.test('intelligent rounding - precision maintenance', () => {
  // Verify that the rounding doesn't introduce floating point errors
  const result1 = formatCentsToNumber(12199);
  assertEquals(result1, 122.00);
  assertEquals(result1.toFixed(2), '122.00');
  
  const result2 = formatCentsToNumber(5649);
  assertEquals(result2, 56.50);
  assertEquals(result2.toFixed(2), '56.50');
  
  const result3 = formatCentsToNumber(12345);
  assertEquals(result3, 123.45);
  assertEquals(result3.toFixed(2), '123.45');
});

// Test boundary conditions for intelligent adjustment
Deno.test('intelligent adjustment - boundary conditions', () => {
  // Test values just above and below adjustment thresholds
  assertEquals(formatCentsToNumber(98), 0.98); // 0.98 stays 0.98
  assertEquals(formatCentsToNumber(99), 0.99); // 0.99 stays 0.99 (below threshold)
  assertEquals(formatCentsToNumber(100), 1.00); // 1.00 stays 1.00
  assertEquals(formatCentsToNumber(101), 1.01); // 1.01 stays 1.01 (below threshold)
  assertEquals(formatCentsToNumber(102), 1.02); // 1.02 stays 1.02
  
  assertEquals(formatCentsToNumber(198), 1.98); // 1.98 stays 1.98
  assertEquals(formatCentsToNumber(199), 2.00); // 1.99 → 2.00 (at threshold)
  assertEquals(formatCentsToNumber(200), 2.00); // 2.00 stays 2.00
  assertEquals(formatCentsToNumber(201), 2.00); // 2.01 → 2.00 (at threshold)
  assertEquals(formatCentsToNumber(202), 2.02); // 2.02 stays 2.02
  
  assertEquals(formatCentsToNumber(48), 0.48); // 0.48 stays 0.48
  assertEquals(formatCentsToNumber(49), 0.50); // 0.49 → 0.50
  assertEquals(formatCentsToNumber(50), 0.50); // 0.50 stays 0.50
});

// Test formatCentsWithCurrency uses intelligent rounding
Deno.test('formatCentsWithCurrency - intelligent rounding behavior', () => {
  // Test intelligent adjustments in currency formatting
  assertEquals(formatCentsWithCurrency(12199), '$122.00'); // 121.99 → 122.00
  assertEquals(formatCentsWithCurrency(12201), '$122.00'); // 122.01 → 122.00
  assertEquals(formatCentsWithCurrency(5649), '$56.50'); // 56.49 → 56.50
  assertEquals(formatCentsWithCurrency(12345), '$123.45'); // 123.45 stays 123.45
  
  // Test with different currency symbols
  assertEquals(formatCentsWithCurrency(12199, '€'), '€122.00');
  assertEquals(formatCentsWithCurrency(5649, '¥'), '¥56.50');
  
  // Test negative amounts
  assertEquals(formatCentsWithCurrency(-12199), '$-122.00');
  assertEquals(formatCentsWithCurrency(-5649), '$-56.50');
  
  // Test string inputs
  assertEquals(formatCentsWithCurrency('12199'), '$122.00');
  assertEquals(formatCentsWithCurrency('5649'), '$56.50');
});