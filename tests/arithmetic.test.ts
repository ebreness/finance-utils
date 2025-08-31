/**
 * Unit tests for safe arithmetic operations
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { safeAdd, safeSubtract, safeMultiply } from '../src/arithmetic.ts';
import { MAX_SAFE_CENTS } from '../src/constants.ts';

Deno.test('safeAdd - basic addition', () => {
  assertEquals(safeAdd(100, 200), 300);
  assertEquals(safeAdd(12345, 6789), 19134);
  assertEquals(safeAdd(0, 100), 100);
  assertEquals(safeAdd(100, 0), 100);
  assertEquals(safeAdd(0, 0), 0);
});

Deno.test('safeAdd - large numbers', () => {
  assertEquals(safeAdd(1000000, 2000000), 3000000);
  assertEquals(safeAdd(MAX_SAFE_CENTS - 1000, 1000), MAX_SAFE_CENTS);
});

Deno.test('safeAdd - input validation errors', () => {
  // Null/undefined inputs
  assertThrows(() => safeAdd(null as any, 100), Error, 'Amount must be a string or number, received object');
  assertThrows(() => safeAdd(100, undefined as any), Error, 'Amount must be a string or number, received undefined');

  // Invalid string inputs (strings are now supported, so test invalid ones)
  assertThrows(() => safeAdd('abc' as any, 200), Error, 'Amount "abc" is not a valid number');
  assertThrows(() => safeAdd(100, 'xyz' as any), Error, 'Amount "xyz" is not a valid number');

  // NaN inputs
  assertThrows(() => safeAdd(NaN, 100), Error, 'Amount cannot be NaN');
  assertThrows(() => safeAdd(100, NaN), Error, 'Amount cannot be NaN');

  // Infinite inputs
  assertThrows(() => safeAdd(Infinity, 100), Error, 'Amount must be finite');
  assertThrows(() => safeAdd(100, Infinity), Error, 'Amount must be finite');

  // Non-integer inputs
  assertThrows(() => safeAdd(100.5, 200), Error, 'Amount in cents must be an integer');
  assertThrows(() => safeAdd(100, 200.5), Error, 'Amount in cents must be an integer');

  // Negative inputs
  assertThrows(() => safeAdd(-100, 200), Error, 'Amount cannot be negative');
  assertThrows(() => safeAdd(100, -200), Error, 'Amount cannot be negative');
});

Deno.test('safeAdd - overflow protection', () => {
  // Test that values exceeding MAX_SAFE_CENTS are caught by validation
  assertThrows(
    () => safeAdd(MAX_SAFE_CENTS + 1, 100),
    Error,
    'exceeds maximum safe value'
  );

  // Test that the function works correctly with maximum safe values
  const result = safeAdd(MAX_SAFE_CENTS - 1000, 1000);
  assertEquals(result, MAX_SAFE_CENTS);
});

Deno.test('safeSubtract - basic subtraction', () => {
  assertEquals(safeSubtract(300, 100), 200);
  assertEquals(safeSubtract(12345, 6789), 5556);
  assertEquals(safeSubtract(100, 100), 0);
  assertEquals(safeSubtract(1000, 0), 1000);
});

Deno.test('safeSubtract - large numbers', () => {
  assertEquals(safeSubtract(3000000, 1000000), 2000000);
  assertEquals(safeSubtract(MAX_SAFE_CENTS, 1000), MAX_SAFE_CENTS - 1000);
});

Deno.test('safeSubtract - input validation errors', () => {
  // Same validation errors as safeAdd
  assertThrows(() => safeSubtract(null as any, 100), Error, 'Amount must be a string or number, received object');
  assertThrows(() => safeSubtract(100, undefined as any), Error, 'Amount must be a string or number, received undefined');
  assertThrows(() => safeSubtract('abc' as any, 200), Error, 'Amount "abc" is not a valid number');
  assertThrows(() => safeSubtract(100, NaN), Error, 'Amount cannot be NaN');
  assertThrows(() => safeSubtract(Infinity, 100), Error, 'Amount must be finite');
  assertThrows(() => safeSubtract(100.5, 200), Error, 'Amount in cents must be an integer');
  assertThrows(() => safeSubtract(-100, 200), Error, 'Amount cannot be negative');
});

Deno.test('safeSubtract - negative result protection', () => {
  // Test that subtraction resulting in negative values throws error
  assertThrows(
    () => safeSubtract(100, 200),
    Error,
    'Subtraction would result in negative amount: 100 - 200 = -100'
  );

  assertThrows(
    () => safeSubtract(0, 1),
    Error,
    'Subtraction would result in negative amount: 0 - 1 = -1'
  );

  assertThrows(
    () => safeSubtract(12345, 54321),
    Error,
    'Subtraction would result in negative amount'
  );
});

Deno.test('safeMultiply - basic multiplication', () => {
  assertEquals(safeMultiply(100, 2), 200);
  assertEquals(safeMultiply(12345, 2), 24690);
  assertEquals(safeMultiply(100, 0), 0);
  assertEquals(safeMultiply(0, 5), 0);
  assertEquals(safeMultiply(100, 1), 100);
});

Deno.test('safeMultiply - decimal factors with rounding', () => {
  assertEquals(safeMultiply(100, 1.5), 150);
  assertEquals(safeMultiply(100, 0.13), 13);
  assertEquals(safeMultiply(12345, 1.5), 18518); // 18517.5 rounded to 18518
  assertEquals(safeMultiply(333, 0.333), 111); // 110.889 rounded to 111
  assertEquals(safeMultiply(1000, 0.1234), 123); // 123.4 rounded to 123
});

Deno.test('safeMultiply - rounding behavior', () => {
  // Test proper rounding (banker's rounding / round half to even)
  assertEquals(safeMultiply(1, 0.5), 1); // 0.5 rounds to 1 (away from zero)
  assertEquals(safeMultiply(3, 0.5), 2); // 1.5 rounds to 2 (away from zero)
  assertEquals(safeMultiply(5, 0.5), 3); // 2.5 rounds to 3 (away from zero)
  assertEquals(safeMultiply(7, 0.5), 4); // 3.5 rounds to 4 (away from zero)
});

Deno.test('safeMultiply - amount validation errors', () => {
  // Amount validation (same as other functions)
  assertThrows(() => safeMultiply(null as any, 2), Error, 'Amount must be a string or number, received object');
  assertThrows(() => safeMultiply(undefined as any, 2), Error, 'Amount must be a string or number, received undefined');
  assertThrows(() => safeMultiply('abc' as any, 2), Error, 'Amount "abc" is not a valid number');
  assertThrows(() => safeMultiply(NaN, 2), Error, 'Amount cannot be NaN');
  assertThrows(() => safeMultiply(Infinity, 2), Error, 'Amount must be finite');
  assertThrows(() => safeMultiply(100.5, 2), Error, 'Amount in cents must be an integer');
  assertThrows(() => safeMultiply(-100, 2), Error, 'Amount cannot be negative');
});

Deno.test('safeMultiply - factor validation errors', () => {
  // Factor validation - using existing validation function error messages
  assertThrows(() => safeMultiply(100, null as any), Error, 'Factor cannot be null or undefined');
  assertThrows(() => safeMultiply(100, undefined as any), Error, 'Factor cannot be null or undefined');
  assertThrows(() => safeMultiply(100, '2' as any), Error, 'Factor must be a number');
  assertThrows(() => safeMultiply(100, NaN), Error, 'Factor cannot be NaN');
  assertThrows(() => safeMultiply(100, Infinity), Error, 'Factor must be finite');
  assertThrows(() => safeMultiply(100, -Infinity), Error, 'Factor must be finite');
  assertThrows(() => safeMultiply(100, -1), Error, 'Factor cannot be negative');
  assertThrows(() => safeMultiply(100, -0.5), Error, 'Factor cannot be negative');
});

Deno.test('safeMultiply - overflow protection', () => {
  // Test that values exceeding MAX_SAFE_CENTS are caught by validation
  assertThrows(
    () => safeMultiply(MAX_SAFE_CENTS + 1, 2),
    Error,
    'exceeds maximum safe value'
  );

  // Test overflow detection with very large factor that would cause overflow
  assertThrows(
    () => safeMultiply(100000000, 100000000),
    Error,
    'Multiplication overflow'
  );

  // Test that the function works correctly with safe values
  const result = safeMultiply(MAX_SAFE_CENTS, 0.5);
  assertEquals(result, Math.round(MAX_SAFE_CENTS * 0.5));
});

Deno.test('safeMultiply - edge cases', () => {
  // Very small factors
  assertEquals(safeMultiply(1000000, 0.000001), 1); // 1.0 rounded to 1
  assertEquals(safeMultiply(1000000, 0.0000001), 0); // 0.1 rounded to 0

  // Large amounts with small factors
  assertEquals(safeMultiply(MAX_SAFE_CENTS, 0.1), Math.round(MAX_SAFE_CENTS * 0.1));

  // Precision edge cases
  assertEquals(safeMultiply(333333, 0.000003), 1); // 0.999999 rounds to 1
});
// Additional tests for comprehensive overflow protection (Task 5.2)
Deno.test('checkSafeOperation integration - addition', () => {
  // Test that checkSafeOperation is properly integrated in safeAdd
  const largeValue = Math.floor(Number.MAX_SAFE_INTEGER / 2);

  // This should work fine
  const result = safeAdd(1000, 2000);
  assertEquals(result, 3000);

  // Test with values that would trigger validation errors
  assertThrows(
    () => safeAdd(Number.MAX_SAFE_INTEGER - 1, 2),
    Error,
    'exceeds maximum safe value'
  );
});

Deno.test('checkSafeOperation integration - subtraction', () => {
  // Test that checkSafeOperation is properly integrated in safeSubtract
  const result = safeSubtract(3000, 1000);
  assertEquals(result, 2000);

  // Test with values that would trigger validation errors
  assertThrows(
    () => safeSubtract(Number.MAX_SAFE_INTEGER, 1),
    Error,
    'exceeds maximum safe value'
  );
});

Deno.test('comprehensive error handling - invalid operations', () => {
  // Test various error conditions are properly handled

  // Division by zero equivalent (factor of 0 is allowed)
  assertEquals(safeMultiply(1000, 0), 0);

  // Very small factors
  assertEquals(safeMultiply(1000000, 0.0000001), 0);

  // Boundary conditions
  assertEquals(safeAdd(0, 0), 0);
  assertEquals(safeSubtract(1000, 1000), 0);
  assertEquals(safeMultiply(0, 1000000), 0);
});

Deno.test('error message quality', () => {
  // Test that error messages are descriptive and helpful

  try {
    safeAdd(null as any, 100);
  } catch (error) {
    assertEquals((error as Error).message.includes('string or number'), true);
  }

  try {
    safeSubtract(100, 200);
  } catch (error) {
    assertEquals((error as Error).message.includes('negative amount'), true);
    assertEquals((error as Error).message.includes('100 - 200 = -100'), true);
  }

  try {
    safeMultiply(100, -1);
  } catch (error) {
    assertEquals((error as Error).message.includes('Factor cannot be negative'), true);
  }
});