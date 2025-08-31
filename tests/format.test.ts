/**
 * Tests for formatting functions
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { formatCentsToNumber, formatPercentToNumber } from '../src/format.ts';

Deno.test('formatCentsToNumber - basic formatting', () => {
  assertEquals(formatCentsToNumber(12345), 123.45);
  assertEquals(formatCentsToNumber(100), 1.00);
  assertEquals(formatCentsToNumber(0), 0.00);
  assertEquals(formatCentsToNumber(1), 0.01);
  assertEquals(formatCentsToNumber(99), 0.99);
});

Deno.test('formatCentsToNumber - large amounts', () => {
  assertEquals(formatCentsToNumber(1000000), 10000.00);
  assertEquals(formatCentsToNumber(3200000), 32000.00);
  assertEquals(formatCentsToNumber(2831858), 28318.58);
});

Deno.test('formatCentsToNumber - negative amounts', () => {
  assertEquals(formatCentsToNumber(-12345), -123.45);
  assertEquals(formatCentsToNumber(-100), -1.00);
  assertEquals(formatCentsToNumber(-1), -0.01);
});

Deno.test('formatCentsToNumber - validation errors', () => {
  assertThrows(() => formatCentsToNumber(123.45), Error, 'must be an integer');
  assertThrows(() => formatCentsToNumber(NaN), Error, 'cannot be NaN');
  assertThrows(() => formatCentsToNumber(Infinity), Error, 'must be finite');
  assertThrows(() => formatCentsToNumber(null as any), Error, 'must be a string or number, received object');
  assertThrows(() => formatCentsToNumber(undefined as any), Error, 'must be a string or number, received undefined');
});

Deno.test('formatPercentToNumber - basic formatting', () => {
  assertEquals(formatPercentToNumber(13.456), 13.46);
  assertEquals(formatPercentToNumber(13.454), 13.45);
  assertEquals(formatPercentToNumber(0.13456), 0.13);
  assertEquals(formatPercentToNumber(100), 100.00);
  assertEquals(formatPercentToNumber(0), 0.00);
});

Deno.test('formatPercentToNumber - edge cases', () => {
  assertEquals(formatPercentToNumber(0.001), 0.00);
  assertEquals(formatPercentToNumber(0.005), 0.01);
  assertEquals(formatPercentToNumber(99.999), 100.00);
  assertEquals(formatPercentToNumber(0.125), 0.13);
});

Deno.test('formatPercentToNumber - negative percentages', () => {
  assertEquals(formatPercentToNumber(-13.456), -13.46);
  assertEquals(formatPercentToNumber(-0.13456), -0.13);
});

Deno.test('formatPercentToNumber - validation errors', () => {
  assertThrows(() => formatPercentToNumber(NaN), Error, 'cannot be NaN');
  assertThrows(() => formatPercentToNumber(Infinity), Error, 'must be finite');
  assertThrows(() => formatPercentToNumber(null as any), Error, 'cannot be null or undefined');
  assertThrows(() => formatPercentToNumber(undefined as any), Error, 'cannot be null or undefined');
});

// Import the currency formatting function
import { formatCentsWithCurrency } from '../src/format.ts';

Deno.test('formatCentsWithCurrency - default formatting (USD)', () => {
  assertEquals(formatCentsWithCurrency(12345), '$123.45');
  assertEquals(formatCentsWithCurrency(100), '$1.00');
  assertEquals(formatCentsWithCurrency(0), '$0.00');
  assertEquals(formatCentsWithCurrency(1), '$0.01');
  assertEquals(formatCentsWithCurrency(3200000), '$32,000.00');
});

Deno.test('formatCentsWithCurrency - custom currency symbols', () => {
  assertEquals(formatCentsWithCurrency(12345, '€'), '€123.45');
  assertEquals(formatCentsWithCurrency(12345, '¥'), '¥123.45');
  assertEquals(formatCentsWithCurrency(12345, '£'), '£123.45');
  assertEquals(formatCentsWithCurrency(12345, 'CAD '), 'CAD 123.45');
});

Deno.test('formatCentsWithCurrency - different locales', () => {
  // German locale uses comma for decimal separator
  assertEquals(formatCentsWithCurrency(12345, '€', 'de-DE'), '€123,45');
  
  // French locale uses space for thousands separator and comma for decimal
  // Note: The actual space character used by Intl.NumberFormat may vary
  const frenchResult = formatCentsWithCurrency(1234567, '€', 'fr-FR');
  // Check that it contains the expected components (currency, numbers, comma)
  assertEquals(frenchResult.startsWith('€'), true);
  assertEquals(frenchResult.includes('12'), true);
  assertEquals(frenchResult.includes('345'), true);
  assertEquals(frenchResult.includes(',67'), true);
  
  // Japanese locale (no decimal places typically, but we force 2)
  assertEquals(formatCentsWithCurrency(1000000, '¥', 'ja-JP'), '¥10,000.00');
});

Deno.test('formatCentsWithCurrency - negative amounts', () => {
  assertEquals(formatCentsWithCurrency(-12345), '$-123.45');
  assertEquals(formatCentsWithCurrency(-100), '$-1.00');
  assertEquals(formatCentsWithCurrency(-1), '$-0.01');
});

Deno.test('formatCentsWithCurrency - large amounts', () => {
  assertEquals(formatCentsWithCurrency(1000000), '$10,000.00');
  assertEquals(formatCentsWithCurrency(100000000), '$1,000,000.00');
  assertEquals(formatCentsWithCurrency(2831858), '$28,318.58');
});

Deno.test('formatCentsWithCurrency - validation errors', () => {
  assertThrows(() => formatCentsWithCurrency(123.45), Error, 'must be an integer');
  assertThrows(() => formatCentsWithCurrency(NaN), Error, 'cannot be NaN');
  assertThrows(() => formatCentsWithCurrency(Infinity), Error, 'must be finite');
  assertThrows(() => formatCentsWithCurrency(null as any), Error, 'must be a string or number, received object');
  assertThrows(() => formatCentsWithCurrency(undefined as any), Error, 'must be a string or number, received undefined');
});

// Import the additional formatting functions
import { formatPercentWithSymbol, clampPercent01, clampPercent0100 } from '../src/format.ts';

Deno.test('formatPercentWithSymbol - basic formatting', () => {
  assertEquals(formatPercentWithSymbol(13.456), '13.46%');
  assertEquals(formatPercentWithSymbol(13.454), '13.45%');
  assertEquals(formatPercentWithSymbol(0.13), '0.13%');
  assertEquals(formatPercentWithSymbol(100), '100.00%');
  assertEquals(formatPercentWithSymbol(0), '0.00%');
});

Deno.test('formatPercentWithSymbol - edge cases', () => {
  assertEquals(formatPercentWithSymbol(0.001), '0.00%');
  assertEquals(formatPercentWithSymbol(0.005), '0.01%');
  assertEquals(formatPercentWithSymbol(99.999), '100.00%');
  assertEquals(formatPercentWithSymbol(-13.456), '-13.46%');
});

Deno.test('formatPercentWithSymbol - validation errors', () => {
  assertThrows(() => formatPercentWithSymbol(NaN), Error, 'cannot be NaN');
  assertThrows(() => formatPercentWithSymbol(Infinity), Error, 'must be finite');
  assertThrows(() => formatPercentWithSymbol(null as any), Error, 'cannot be null or undefined');
  assertThrows(() => formatPercentWithSymbol(undefined as any), Error, 'cannot be null or undefined');
});

Deno.test('clampPercent01 - normal range', () => {
  assertEquals(clampPercent01(0.5), 0.5);
  assertEquals(clampPercent01(0), 0);
  assertEquals(clampPercent01(1), 1);
  assertEquals(clampPercent01(0.13), 0.13);
  assertEquals(clampPercent01(0.999), 0.999);
});

Deno.test('clampPercent01 - clamping behavior', () => {
  assertEquals(clampPercent01(-0.1), 0);
  assertEquals(clampPercent01(-10), 0);
  assertEquals(clampPercent01(1.5), 1);
  assertEquals(clampPercent01(100), 1);
  assertEquals(clampPercent01(1.001), 1);
});

Deno.test('clampPercent01 - validation errors', () => {
  assertThrows(() => clampPercent01(NaN), Error, 'cannot be NaN');
  assertThrows(() => clampPercent01(Infinity), Error, 'must be finite');
  assertThrows(() => clampPercent01(null as any), Error, 'cannot be null or undefined');
  assertThrows(() => clampPercent01(undefined as any), Error, 'cannot be null or undefined');
});

Deno.test('clampPercent0100 - normal range', () => {
  assertEquals(clampPercent0100(50), 50);
  assertEquals(clampPercent0100(0), 0);
  assertEquals(clampPercent0100(100), 100);
  assertEquals(clampPercent0100(13), 13);
  assertEquals(clampPercent0100(99.9), 99.9);
});

Deno.test('clampPercent0100 - clamping behavior', () => {
  assertEquals(clampPercent0100(-10), 0);
  assertEquals(clampPercent0100(-0.1), 0);
  assertEquals(clampPercent0100(150), 100);
  assertEquals(clampPercent0100(100.1), 100);
  assertEquals(clampPercent0100(1000), 100);
});

Deno.test('clampPercent0100 - validation errors', () => {
  assertThrows(() => clampPercent0100(NaN), Error, 'cannot be NaN');
  assertThrows(() => clampPercent0100(Infinity), Error, 'must be finite');
  assertThrows(() => clampPercent0100(null as any), Error, 'cannot be null or undefined');
  assertThrows(() => clampPercent0100(undefined as any), Error, 'cannot be null or undefined');
});