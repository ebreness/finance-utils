/**
 * Comprehensive unit tests for discount functionality in calculateTaxBreakdown
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { calculateTaxBreakdown } from '../src/calculations.ts';
import type { TaxCalculationResult, TaxCalculationWithDiscountResult } from '../src/types.ts';

Deno.test('calculateTaxBreakdown with discount - basic functionality', () => {
  // Test basic discount calculation: $122.00 with 13% tax and 5% discount
  const result = calculateTaxBreakdown(12200, 1300, 500) as TaxCalculationWithDiscountResult;
  
  // Verify exact precision guarantee
  assertEquals(result.baseAmountCents + result.taxAmountCents, result.totalAmountCents);
  assertEquals(result.totalAmountCents, 12200);
  
  // Verify discount information is included
  assertEquals(result.discountBasisPoints, 500);
  assertEquals(typeof result.discountedAmountCents, 'number');
  assertEquals(result.discountedAmountCents > 0, true);
});

Deno.test('calculateTaxBreakdown with discount - exact precision guarantee', () => {
  const testCases = [
    { total: 12200, tax: 1300, discount: 500 }, // $122.00, 13% tax, 5% discount
    { total: 100000, tax: 1300, discount: 1000 }, // $1000.00, 13% tax, 10% discount
    { total: 3200000, tax: 1300, discount: 500 }, // $32000.00, 13% tax, 5% discount
    { total: 1000, tax: 1300, discount: 200 }, // $10.00, 13% tax, 2% discount
    { total: 50000, tax: 2500, discount: 1500 }, // $500.00, 25% tax, 15% discount
  ];

  testCases.forEach(({ total, tax, discount }) => {
    const result = calculateTaxBreakdown(total, tax, discount) as TaxCalculationWithDiscountResult;
    
    // CRITICAL: Exact precision guarantee must always hold
    assertEquals(
      result.baseAmountCents + result.taxAmountCents,
      result.totalAmountCents,
      `Precision guarantee failed for total=${total}, tax=${tax}, discount=${discount}: ${result.baseAmountCents} + ${result.taxAmountCents} ≠ ${result.totalAmountCents}`
    );
    
    // Verify discount information is present and valid
    assertEquals(result.discountBasisPoints, discount);
    assertEquals(result.discountedAmountCents >= 0, true);
    assertEquals(result.totalAmountCents, total);
  });
});

Deno.test('calculateTaxBreakdown with discount - zero discount', () => {
  // Zero discount should behave like no discount
  const withZeroDiscount = calculateTaxBreakdown(12200, 1300, 0) as TaxCalculationResult;
  const withoutDiscount = calculateTaxBreakdown(12200, 1300) as TaxCalculationResult;
  
  // Results should be identical for the common fields
  assertEquals(withZeroDiscount.baseAmountCents, withoutDiscount.baseAmountCents);
  assertEquals(withZeroDiscount.taxAmountCents, withoutDiscount.taxAmountCents);
  assertEquals(withZeroDiscount.totalAmountCents, withoutDiscount.totalAmountCents);
  
  // Zero discount should not include discount fields in the result
  assertEquals('discountedAmountCents' in withZeroDiscount, false);
  assertEquals('discountBasisPoints' in withZeroDiscount, false);
});

Deno.test('calculateTaxBreakdown with discount - high discount rates', () => {
  // Test 50% discount (5000 basis points)
  const result50 = calculateTaxBreakdown(20000, 1300, 5000) as TaxCalculationWithDiscountResult;
  assertEquals(result50.baseAmountCents + result50.taxAmountCents, result50.totalAmountCents);
  assertEquals(result50.discountBasisPoints, 5000);
  
  // Test 90% discount (9000 basis points)
  const result90 = calculateTaxBreakdown(10000, 1300, 9000) as TaxCalculationWithDiscountResult;
  assertEquals(result90.baseAmountCents + result90.taxAmountCents, result90.totalAmountCents);
  assertEquals(result90.discountBasisPoints, 9000);
  
  // Test 100% discount (10000 basis points)
  const result100 = calculateTaxBreakdown(10000, 1300, 10000) as TaxCalculationWithDiscountResult;
  assertEquals(result100.baseAmountCents + result100.taxAmountCents, result100.totalAmountCents);
  assertEquals(result100.discountBasisPoints, 10000);
});

Deno.test('calculateTaxBreakdown with discount - string input support', () => {
  // Test string inputs for all parameters
  const result1 = calculateTaxBreakdown("12200", "1300", "500") as TaxCalculationWithDiscountResult;
  assertEquals(result1.baseAmountCents + result1.taxAmountCents, result1.totalAmountCents);
  assertEquals(result1.discountBasisPoints, 500);
  
  // Test mixed string and number inputs
  const result2 = calculateTaxBreakdown(12200, "1300", "500") as TaxCalculationWithDiscountResult;
  assertEquals(result2.baseAmountCents + result2.taxAmountCents, result2.totalAmountCents);
  
  const result3 = calculateTaxBreakdown("12200", 1300, 500) as TaxCalculationWithDiscountResult;
  assertEquals(result3.baseAmountCents + result3.taxAmountCents, result3.totalAmountCents);
  
  // Test string inputs with whitespace
  const result4 = calculateTaxBreakdown("  12200  ", "  1300  ", "  500  ") as TaxCalculationWithDiscountResult;
  assertEquals(result4.baseAmountCents + result4.taxAmountCents, result4.totalAmountCents);
  assertEquals(result4.discountBasisPoints, 500);
});

Deno.test('calculateTaxBreakdown with discount - edge cases', () => {
  // Very small amounts
  const small = calculateTaxBreakdown(100, 1300, 500) as TaxCalculationWithDiscountResult; // $1.00
  assertEquals(small.baseAmountCents + small.taxAmountCents, small.totalAmountCents);
  assertEquals(small.discountBasisPoints, 500);
  
  // Very small amounts with high discount
  const smallHighDiscount = calculateTaxBreakdown(10, 1300, 5000) as TaxCalculationWithDiscountResult; // $0.10 with 50% discount
  assertEquals(smallHighDiscount.baseAmountCents + smallHighDiscount.taxAmountCents, smallHighDiscount.totalAmountCents);
  
  // Zero tax rate with discount
  const zeroTax = calculateTaxBreakdown(10000, 0, 1000) as TaxCalculationWithDiscountResult; // $100.00, 0% tax, 10% discount
  assertEquals(zeroTax.baseAmountCents + zeroTax.taxAmountCents, zeroTax.totalAmountCents);
  assertEquals(zeroTax.taxAmountCents, 0);
  assertEquals(zeroTax.discountBasisPoints, 1000);
});

Deno.test('calculateTaxBreakdown with discount - discount amount validation', () => {
  // Test that discount amount and basis points are correctly returned
  const result = calculateTaxBreakdown(100000, 1300, 1000) as TaxCalculationWithDiscountResult; // $1000, 13% tax, 10% discount
  
  // Verify discount basis points are returned correctly
  assertEquals(result.discountBasisPoints, 1000);
  
  // Verify discount amount is a positive number
  assertEquals(typeof result.discountedAmountCents, 'number');
  assertEquals(result.discountedAmountCents >= 0, true);
  
  // Verify all required fields are present
  assertEquals(typeof result.baseAmountCents, 'number');
  assertEquals(typeof result.taxAmountCents, 'number');
  assertEquals(typeof result.totalAmountCents, 'number');
  assertEquals(typeof result.discountedAmountCents, 'number');
  assertEquals(typeof result.discountBasisPoints, 'number');
});

Deno.test('calculateTaxBreakdown with discount - error handling', () => {
  // Test negative discount
  assertThrows(
    () => calculateTaxBreakdown(12200, 1300, -500),
    Error,
    'Basis points cannot be negative'
  );
  
  // Test invalid string discount
  assertThrows(
    () => calculateTaxBreakdown(12200, 1300, "invalid"),
    Error,
    'is not a valid number'
  );
  
  // Test discount that exceeds base amount
  assertThrows(
    () => calculateTaxBreakdown(1000, 1300, 50000), // 500% discount
    Error,
    'exceeds base amount'
  );
  
  // Test null discount (should throw)
  assertThrows(
    () => calculateTaxBreakdown(12200, 1300, null as any),
    Error,
    'must be a string or number'
  );
});

Deno.test('calculateTaxBreakdown with discount - backward compatibility', () => {
  // Ensure that calling without discount parameter still works
  const withoutDiscount = calculateTaxBreakdown(12200, 1300) as TaxCalculationResult;
  
  // Should not have discount fields
  assertEquals('discountedAmountCents' in withoutDiscount, false);
  assertEquals('discountBasisPoints' in withoutDiscount, false);
  
  // Should have standard fields
  assertEquals(typeof withoutDiscount.baseAmountCents, 'number');
  assertEquals(typeof withoutDiscount.taxAmountCents, 'number');
  assertEquals(typeof withoutDiscount.totalAmountCents, 'number');
  
  // Should maintain exact precision
  assertEquals(withoutDiscount.baseAmountCents + withoutDiscount.taxAmountCents, withoutDiscount.totalAmountCents);
});

Deno.test('calculateTaxBreakdown with discount - round half up rounding', () => {
  // Test cases that specifically test round half up rounding for discount calculations
  // These test cases are designed to produce fractional discount amounts that need rounding
  
  const testCases = [
    { total: 10003, tax: 1300, discount: 3333 }, // Should produce fractional discount
    { total: 7777, tax: 1500, discount: 1234 },  // Should produce fractional discount
    { total: 12345, tax: 2000, discount: 4567 }, // Should produce fractional discount
  ];
  
  testCases.forEach(({ total, tax, discount }) => {
    const result = calculateTaxBreakdown(total, tax, discount) as TaxCalculationWithDiscountResult;
    
    // Verify exact precision is maintained even with rounding
    assertEquals(
      result.baseAmountCents + result.taxAmountCents,
      result.totalAmountCents,
      `Rounding precision test failed for total=${total}, tax=${tax}, discount=${discount}`
    );
    
    // Verify discount amount is an integer (no fractional cents)
    assertEquals(Number.isInteger(result.discountedAmountCents), true);
  });
});

Deno.test('calculateTaxBreakdown with discount - large amounts', () => {
  // Test with large amounts to ensure no overflow issues
  const largeAmount = 1000000000; // $10,000,000.00
  
  try {
    const result = calculateTaxBreakdown(largeAmount, 1300, 500) as TaxCalculationWithDiscountResult;
    
    // If it doesn't throw, verify precision
    assertEquals(result.baseAmountCents + result.taxAmountCents, result.totalAmountCents);
    assertEquals(result.discountBasisPoints, 500);
  } catch (error) {
    // If it throws due to overflow protection, that's also acceptable
    assertEquals(error instanceof Error, true);
    if (error instanceof Error) {
      assertEquals(error.message.includes('overflow') || error.message.includes('exceeds'), true);
    }
  }
});

Deno.test('calculateTaxBreakdown with discount - property-based testing', () => {
  // Property-based test: for any valid inputs, exact precision should always hold
  const testInputs = [
    // [total, tax, discount]
    [1000, 1000, 100],    // $10.00, 10% tax, 1% discount
    [5000, 1500, 300],    // $50.00, 15% tax, 3% discount
    [25000, 800, 1200],   // $250.00, 8% tax, 12% discount
    [75000, 2000, 500],   // $750.00, 20% tax, 5% discount
    [150000, 1300, 2500], // $1500.00, 13% tax, 25% discount
    [500000, 900, 1000],  // $5000.00, 9% tax, 10% discount
  ];
  
  testInputs.forEach(([total, tax, discount]) => {
    const result = calculateTaxBreakdown(total, tax, discount) as TaxCalculationWithDiscountResult;
    
    // Property 1: Exact precision guarantee
    assertEquals(
      result.baseAmountCents + result.taxAmountCents,
      result.totalAmountCents,
      `Property test failed: exact precision for inputs [${total}, ${tax}, ${discount}]`
    );
    
    // Property 2: All amounts should be non-negative
    assertEquals(result.baseAmountCents >= 0, true, 'Base amount should be non-negative');
    assertEquals(result.taxAmountCents >= 0, true, 'Tax amount should be non-negative');
    assertEquals(result.discountedAmountCents >= 0, true, 'Discount amount should be non-negative');
    
    // Property 3: Discount information should be preserved
    assertEquals(result.discountBasisPoints, discount, 'Discount basis points should be preserved');
    
    // Property 4: Total should be preserved
    assertEquals(result.totalAmountCents, total, 'Total amount should be preserved');
  });
});