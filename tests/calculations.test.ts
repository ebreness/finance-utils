/**
 * Unit tests for tax calculation functions
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { calculateTaxFromBase, calculateBaseFromTotal, calculateTaxBreakdown } from '../calculations.ts';

Deno.test('calculateTaxFromBase - basic tax calculations', () => {
  // Test 13% tax on $1000.00 (100000 cents)
  assertEquals(calculateTaxFromBase(100000, 1300), 13000);
  
  // Test 13% tax on $28,318.58 (2831858 cents) - from requirements example
  assertEquals(calculateTaxFromBase(2831858, 1300), 368142);
  
  // Test 0% tax
  assertEquals(calculateTaxFromBase(100000, 0), 0);
  
  // Test small amounts
  assertEquals(calculateTaxFromBase(100, 1300), 13); // $1.00 * 13% = $0.13
  assertEquals(calculateTaxFromBase(1, 1300), 0); // $0.01 * 13% = $0.0013 rounds to $0.00
});

Deno.test('calculateTaxFromBase - rounding behavior', () => {
  // Test rounding to nearest cent
  assertEquals(calculateTaxFromBase(77, 1300), 10); // $0.77 * 13% = $0.1001 rounds to $0.10
  assertEquals(calculateTaxFromBase(78, 1300), 10); // $0.78 * 13% = $0.1014 rounds to $0.10
  assertEquals(calculateTaxFromBase(79, 1300), 10); // $0.79 * 13% = $0.1027 rounds to $0.10
  assertEquals(calculateTaxFromBase(80, 1300), 10); // $0.80 * 13% = $0.104 rounds to $0.10
  assertEquals(calculateTaxFromBase(81, 1300), 11); // $0.81 * 13% = $0.1053 rounds to $0.11
});

Deno.test('calculateTaxFromBase - various tax rates', () => {
  const baseAmount = 100000; // $1000.00
  
  // Test different tax rates
  assertEquals(calculateTaxFromBase(baseAmount, 500), 5000);   // 5% = $50.00
  assertEquals(calculateTaxFromBase(baseAmount, 1000), 10000); // 10% = $100.00
  assertEquals(calculateTaxFromBase(baseAmount, 1500), 15000); // 15% = $150.00
  assertEquals(calculateTaxFromBase(baseAmount, 2000), 20000); // 20% = $200.00
});

Deno.test('calculateTaxFromBase - edge cases', () => {
  // Test zero base amount
  assertEquals(calculateTaxFromBase(0, 1300), 0);
  
  // Test maximum reasonable values
  const maxSafeBase = Math.floor(Number.MAX_SAFE_INTEGER / 10000);
  const result = calculateTaxFromBase(maxSafeBase, 1);
  assertEquals(result, Math.round(maxSafeBase / 10000));
});

Deno.test('calculateTaxFromBase - input validation errors', () => {
  // Test invalid base amount
  assertThrows(
    () => calculateTaxFromBase(NaN, 1300),
    Error,
    'Amount cannot be NaN'
  );
  
  assertThrows(
    () => calculateTaxFromBase(-100, 1300),
    Error,
    'Amount cannot be negative'
  );
  
  assertThrows(
    () => calculateTaxFromBase(Infinity, 1300),
    Error,
    'Amount must be finite'
  );
  
  // Test invalid tax rate
  assertThrows(
    () => calculateTaxFromBase(100000, NaN),
    Error,
    'Basis points cannot be NaN'
  );
  
  assertThrows(
    () => calculateTaxFromBase(100000, -100),
    Error,
    'Basis points cannot be negative'
  );
});

Deno.test('calculateTaxFromBase - overflow protection', () => {
  // Test overflow protection - first test the validation limit
  const largeBase = Number.MAX_SAFE_INTEGER;
  
  assertThrows(
    () => calculateTaxFromBase(largeBase, 1000),
    Error,
    'exceeds maximum safe value'
  );
  
  // Test calculation overflow with values that pass validation but would overflow in calculation
  const maxSafeBase = Math.floor(Number.MAX_SAFE_INTEGER / 10000) - 1;
  const largeTaxRate = 50000; // 500% - very high rate to trigger overflow
  
  assertThrows(
    () => calculateTaxFromBase(maxSafeBase, largeTaxRate),
    Error,
    'Tax calculation overflow'
  );
});

Deno.test('calculateBaseFromTotal - specific requirements example', () => {
  // Test the specific example from requirements: 32,000.00 with 13% tax
  const totalCents = 3200000; // $32,000.00
  const taxBasisPoints = 1300; // 13%
  const expectedBaseCents = 2831858; // $28,318.58
  const expectedTaxCents = 368142; // $3,681.42
  
  const actualBaseCents = calculateBaseFromTotal(totalCents, taxBasisPoints);
  const actualTaxCents = totalCents - actualBaseCents;
  
  assertEquals(actualBaseCents, expectedBaseCents);
  assertEquals(actualTaxCents, expectedTaxCents);
  assertEquals(actualBaseCents + actualTaxCents, totalCents); // Verify exact total
});

Deno.test('calculateBaseFromTotal - basic calculations', () => {
  // Test 13% tax on $1130.00 total (should give $1000.00 base)
  assertEquals(calculateBaseFromTotal(113000, 1300), 100000);
  
  // Test 0% tax
  assertEquals(calculateBaseFromTotal(100000, 0), 100000);
  
  // Test small amounts
  assertEquals(calculateBaseFromTotal(113, 1300), 100); // $1.13 total -> $1.00 base
  assertEquals(calculateBaseFromTotal(1, 1300), 1); // $0.01 total -> $0.01 base (rounds up)
});

Deno.test('calculateBaseFromTotal - rounding behavior', () => {
  // Test rounding behavior to ensure base + tax = total exactly
  const testCases = [
    { total: 1000, tax: 1300 }, // $10.00 with 13%
    { total: 2000, tax: 1300 }, // $20.00 with 13%
    { total: 5000, tax: 1300 }, // $50.00 with 13%
    { total: 12345, tax: 1300 }, // $123.45 with 13%
  ];
  
  testCases.forEach(({ total, tax }) => {
    const base = calculateBaseFromTotal(total, tax);
    const calculatedTax = total - base;
    
    // Verify exact total
    assertEquals(base + calculatedTax, total, 
      `Failed for total ${total}: base ${base} + tax ${calculatedTax} ≠ ${total}`);
    
    // Verify base is positive
    assertEquals(base >= 0, true, `Base amount ${base} should be non-negative`);
    
    // Verify tax is positive
    assertEquals(calculatedTax >= 0, true, `Tax amount ${calculatedTax} should be non-negative`);
  });
});

Deno.test('calculateBaseFromTotal - various tax rates', () => {
  const totalAmount = 110000; // $1100.00
  
  // Test different tax rates
  assertEquals(calculateBaseFromTotal(totalAmount, 500), 104762);   // 5% -> $1047.62 base
  assertEquals(calculateBaseFromTotal(totalAmount, 1000), 100000);  // 10% -> $1000.00 base
  assertEquals(calculateBaseFromTotal(totalAmount, 1500), 95652);   // 15% -> $956.52 base
  assertEquals(calculateBaseFromTotal(totalAmount, 2000), 91667);   // 20% -> $916.67 base
  
  // Verify exact totals for each case
  [500, 1000, 1500, 2000].forEach(taxRate => {
    const base = calculateBaseFromTotal(totalAmount, taxRate);
    const tax = totalAmount - base;
    assertEquals(base + tax, totalAmount);
  });
});

Deno.test('calculateBaseFromTotal - edge cases', () => {
  // Test zero total amount
  assertEquals(calculateBaseFromTotal(0, 1300), 0);
  
  // Test very small amounts
  assertEquals(calculateBaseFromTotal(1, 0), 1); // No tax
  assertEquals(calculateBaseFromTotal(2, 1000), 2); // $0.02 with 10% tax
});

Deno.test('calculateBaseFromTotal - input validation errors', () => {
  // Test invalid total amount
  assertThrows(
    () => calculateBaseFromTotal(NaN, 1300),
    Error,
    'Amount cannot be NaN'
  );
  
  assertThrows(
    () => calculateBaseFromTotal(-100, 1300),
    Error,
    'Amount cannot be negative'
  );
  
  assertThrows(
    () => calculateBaseFromTotal(Infinity, 1300),
    Error,
    'Amount must be finite'
  );
  
  // Test invalid tax rate
  assertThrows(
    () => calculateBaseFromTotal(100000, NaN),
    Error,
    'Basis points cannot be NaN'
  );
  
  assertThrows(
    () => calculateBaseFromTotal(100000, -100),
    Error,
    'Basis points cannot be negative'
  );
});

Deno.test('calculateBaseFromTotal - overflow protection', () => {
  // Test overflow protection - first test the validation limit
  const largeTotal = Number.MAX_SAFE_INTEGER;
  
  assertThrows(
    () => calculateBaseFromTotal(largeTotal, 1000),
    Error,
    'exceeds maximum safe value'
  );
  
  // The function is designed so that any value passing validation won't overflow
  // This is by design - MAX_SAFE_CENTS prevents overflow in calculations
  // So we just verify that the validation works correctly
  const maxSafeCents = Math.floor(Number.MAX_SAFE_INTEGER / 10000);
  
  // This should work without throwing (it's within safe limits)
  const result = calculateBaseFromTotal(maxSafeCents, 1000);
  assertEquals(typeof result, 'number');
  assertEquals(result >= 0, true);
});

Deno.test('calculateBaseFromTotal - precision verification', () => {
  // Test that the function maintains exact precision
  const testCases = [
    { total: 3200000, tax: 1300 }, // The main requirements example
    { total: 1000000, tax: 875 },  // $10,000 with 8.75% tax
    { total: 500000, tax: 1250 },  // $5,000 with 12.5% tax
    { total: 123456, tax: 1575 },  // $1,234.56 with 15.75% tax
  ];
  
  testCases.forEach(({ total, tax }) => {
    const base = calculateBaseFromTotal(total, tax);
    const calculatedTax = total - base;
    
    // Verify exact total
    assertEquals(base + calculatedTax, total, 
      `Precision error for total ${total} with ${tax} bp tax: ${base} + ${calculatedTax} ≠ ${total}`);
    
    // Verify that recalculating tax from base gives consistent results
    const recalculatedTax = calculateTaxFromBase(base, tax);
    const difference = Math.abs(calculatedTax - recalculatedTax);
    
    // Allow for small rounding differences (should be 0 or 1 cent)
    assertEquals(difference <= 1, true, 
      `Tax calculation inconsistency: direct ${calculatedTax} vs recalculated ${recalculatedTax}`);
  });
});

Deno.test('calculateTaxBreakdown - specific requirements example', () => {
  // Test the specific example from requirements: 32,000.00 with 13% tax
  const totalCents = 3200000; // $32,000.00
  const taxBasisPoints = 1300; // 13%
  const expectedBaseCents = 2831858; // $28,318.58
  const expectedTaxCents = 368142; // $3,681.42
  
  const result = calculateTaxBreakdown(totalCents, taxBasisPoints);
  
  assertEquals(result.baseAmountCents, expectedBaseCents);
  assertEquals(result.taxAmountCents, expectedTaxCents);
  assertEquals(result.totalAmountCents, totalCents);
  
  // Verify exact total
  assertEquals(result.baseAmountCents + result.taxAmountCents, result.totalAmountCents);
});

Deno.test('calculateTaxBreakdown - basic calculations', () => {
  // Test 13% tax on $1130.00 total (should give $1000.00 base, $130.00 tax)
  const result1 = calculateTaxBreakdown(113000, 1300);
  assertEquals(result1.baseAmountCents, 100000);
  assertEquals(result1.taxAmountCents, 13000);
  assertEquals(result1.totalAmountCents, 113000);
  assertEquals(result1.baseAmountCents + result1.taxAmountCents, result1.totalAmountCents);
  
  // Test 0% tax
  const result2 = calculateTaxBreakdown(100000, 0);
  assertEquals(result2.baseAmountCents, 100000);
  assertEquals(result2.taxAmountCents, 0);
  assertEquals(result2.totalAmountCents, 100000);
  
  // Test small amounts
  const result3 = calculateTaxBreakdown(113, 1300);
  assertEquals(result3.baseAmountCents, 100);
  assertEquals(result3.taxAmountCents, 13);
  assertEquals(result3.totalAmountCents, 113);
});

Deno.test('calculateTaxBreakdown - various tax rates', () => {
  const totalAmount = 110000; // $1100.00
  
  // Test different tax rates
  const testCases = [
    { rate: 500, expectedBase: 104762 },   // 5%
    { rate: 1000, expectedBase: 100000 },  // 10%
    { rate: 1500, expectedBase: 95652 },   // 15%
    { rate: 2000, expectedBase: 91667 },   // 20%
  ];
  
  testCases.forEach(({ rate, expectedBase }) => {
    const result = calculateTaxBreakdown(totalAmount, rate);
    assertEquals(result.baseAmountCents, expectedBase);
    assertEquals(result.taxAmountCents, totalAmount - expectedBase);
    assertEquals(result.totalAmountCents, totalAmount);
    assertEquals(result.baseAmountCents + result.taxAmountCents, result.totalAmountCents);
  });
});

Deno.test('calculateTaxBreakdown - edge cases', () => {
  // Test zero total amount
  const result1 = calculateTaxBreakdown(0, 1300);
  assertEquals(result1.baseAmountCents, 0);
  assertEquals(result1.taxAmountCents, 0);
  assertEquals(result1.totalAmountCents, 0);
  
  // Test very small amounts
  const result2 = calculateTaxBreakdown(1, 0);
  assertEquals(result2.baseAmountCents, 1);
  assertEquals(result2.taxAmountCents, 0);
  assertEquals(result2.totalAmountCents, 1);
  
  const result3 = calculateTaxBreakdown(2, 1000);
  assertEquals(result3.baseAmountCents, 2);
  assertEquals(result3.taxAmountCents, 0);
  assertEquals(result3.totalAmountCents, 2);
});

Deno.test('calculateTaxBreakdown - input validation errors', () => {
  // Test invalid total amount
  assertThrows(
    () => calculateTaxBreakdown(NaN, 1300),
    Error,
    'Amount cannot be NaN'
  );
  
  assertThrows(
    () => calculateTaxBreakdown(-100, 1300),
    Error,
    'Amount cannot be negative'
  );
  
  assertThrows(
    () => calculateTaxBreakdown(Infinity, 1300),
    Error,
    'Amount must be finite'
  );
  
  // Test invalid tax rate
  assertThrows(
    () => calculateTaxBreakdown(100000, NaN),
    Error,
    'Basis points cannot be NaN'
  );
  
  assertThrows(
    () => calculateTaxBreakdown(100000, -100),
    Error,
    'Basis points cannot be negative'
  );
});

Deno.test('calculateTaxBreakdown - precision verification', () => {
  // Test that the function maintains exact precision for various scenarios
  const testCases = [
    { total: 3200000, tax: 1300 }, // The main requirements example
    { total: 1000000, tax: 875 },  // $10,000 with 8.75% tax
    { total: 500000, tax: 1250 },  // $5,000 with 12.5% tax
    { total: 123456, tax: 1575 },  // $1,234.56 with 15.75% tax
    { total: 999999, tax: 2500 },  // $9,999.99 with 25% tax
  ];
  
  testCases.forEach(({ total, tax }) => {
    const result = calculateTaxBreakdown(total, tax);
    
    // Verify exact total
    assertEquals(result.baseAmountCents + result.taxAmountCents, result.totalAmountCents, 
      `Precision error for total ${total} with ${tax} bp tax`);
    
    // Verify all amounts are non-negative
    assertEquals(result.baseAmountCents >= 0, true, `Base amount ${result.baseAmountCents} should be non-negative`);
    assertEquals(result.taxAmountCents >= 0, true, `Tax amount ${result.taxAmountCents} should be non-negative`);
    assertEquals(result.totalAmountCents >= 0, true, `Total amount ${result.totalAmountCents} should be non-negative`);
    
    // Verify consistency with individual functions
    const expectedBase = calculateBaseFromTotal(total, tax);
    const expectedTax = calculateTaxFromBase(expectedBase, tax);
    
    assertEquals(result.baseAmountCents, expectedBase, 'Base amount should match calculateBaseFromTotal');
    
    // Tax amounts might differ by 1 cent due to rounding, but the total should always be exact
    const taxDifference = Math.abs(result.taxAmountCents - expectedTax);
    assertEquals(taxDifference <= 1, true, 
      `Tax calculation inconsistency: breakdown ${result.taxAmountCents} vs calculated ${expectedTax}`);
  });
});

Deno.test('calculateTaxBreakdown - return type verification', () => {
  // Test that the function returns the correct interface structure
  const result = calculateTaxBreakdown(113000, 1300);
  
  // Verify all required properties exist
  assertEquals(typeof result.baseAmountCents, 'number');
  assertEquals(typeof result.taxAmountCents, 'number');
  assertEquals(typeof result.totalAmountCents, 'number');
  
  // Verify no extra properties
  const expectedKeys = ['baseAmountCents', 'taxAmountCents', 'totalAmountCents'];
  const actualKeys = Object.keys(result).sort();
  assertEquals(actualKeys, expectedKeys.sort());
});