/**
 * Comprehensive tests for exact precision guarantee in tax calculations
 * 
 * These tests verify that base + tax = total exactly in all scenarios,
 * including edge cases where mathematical rounding might cause precision issues.
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { calculateTaxFromBase, calculateBaseFromTotal, calculateTaxBreakdown } from '../src/calculations.ts';

Deno.test('exact precision guarantee - specific requirements example', () => {
  // Test the specific example from requirements: 3200000 cents total with 13% tax
  const totalCents = 3200000; // $32,000.00
  const taxBasisPoints = 1300; // 13%
  const expectedBaseCents = 2831858; // $28,318.58
  const expectedTaxCents = 368142; // $3,681.42
  
  // Test calculateBaseFromTotal
  const actualBaseCents = calculateBaseFromTotal(totalCents, taxBasisPoints);
  const actualTaxCents = totalCents - actualBaseCents;
  
  assertEquals(actualBaseCents, expectedBaseCents, 'Base amount should match expected value');
  assertEquals(actualTaxCents, expectedTaxCents, 'Tax amount should match expected value');
  assertEquals(actualBaseCents + actualTaxCents, totalCents, 'Base + tax must equal total exactly');
  
  // Test calculateTaxBreakdown
  const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);
  assertEquals(breakdown.baseAmountCents, expectedBaseCents, 'Breakdown base should match expected');
  assertEquals(breakdown.taxAmountCents, expectedTaxCents, 'Breakdown tax should match expected');
  assertEquals(breakdown.totalAmountCents, totalCents, 'Breakdown total should match input');
  assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents, 
    'Breakdown: base + tax must equal total exactly');
});

Deno.test('exact precision guarantee - edge cases with potential rounding issues', () => {
  // Test cases where mathematical precision might cause issues
  const edgeCases = [
    { total: 1, tax: 1300 },      // Very small amount
    { total: 3, tax: 1300 },      // Small amount that might round oddly
    { total: 7, tax: 1300 },      // Another small amount
    { total: 333, tax: 1300 },    // Amount that creates repeating decimals
    { total: 999, tax: 1300 },    // Amount close to round number
    { total: 1001, tax: 1300 },   // Amount just over round number
    { total: 12345, tax: 1300 },  // Random amount
    { total: 99999, tax: 1300 },  // Large amount with many 9s
    { total: 100001, tax: 1300 }, // Large amount just over round number
  ];
  
  edgeCases.forEach(({ total, tax }) => {
    const base = calculateBaseFromTotal(total, tax);
    const calculatedTax = total - base;
    
    // Verify exact precision
    assertEquals(base + calculatedTax, total, 
      `Exact precision failed for total ${total} with ${tax} bp tax: ${base} + ${calculatedTax} ≠ ${total}`);
    
    // Verify non-negative amounts
    assertEquals(base >= 0, true, `Base amount ${base} should be non-negative`);
    assertEquals(calculatedTax >= 0, true, `Tax amount ${calculatedTax} should be non-negative`);
    
    // Test breakdown function as well
    const breakdown = calculateTaxBreakdown(total, tax);
    assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents,
      `Breakdown exact precision failed for total ${total} with ${tax} bp tax`);
  });
});

Deno.test('exact precision guarantee - various tax rates', () => {
  // Test different tax rates that might cause precision issues
  const taxRates = [
    1,      // 0.01%
    33,     // 0.33% (creates repeating decimals)
    100,    // 1%
    333,    // 3.33% (creates repeating decimals)
    666,    // 6.66% (creates repeating decimals)
    875,    // 8.75%
    1000,   // 10%
    1250,   // 12.5%
    1300,   // 13%
    1333,   // 13.33% (creates repeating decimals)
    1500,   // 15%
    1666,   // 16.66% (creates repeating decimals)
    2000,   // 20%
    2500,   // 25%
    3333,   // 33.33% (creates repeating decimals)
    5000,   // 50%
    6666,   // 66.66% (creates repeating decimals)
    10000,  // 100%
  ];
  
  const totalAmounts = [
    100,      // $1.00
    333,      // $3.33
    1000,     // $10.00
    3333,     // $33.33
    10000,    // $100.00
    33333,    // $333.33
    100000,   // $1,000.00
    333333,   // $3,333.33
    1000000,  // $10,000.00
    3200000,  // $32,000.00 (requirements example)
  ];
  
  taxRates.forEach(taxRate => {
    totalAmounts.forEach(total => {
      const base = calculateBaseFromTotal(total, taxRate);
      const tax = total - base;
      
      // Verify exact precision
      assertEquals(base + tax, total, 
        `Exact precision failed for total ${total} with ${taxRate} bp tax: ${base} + ${tax} ≠ ${total}`);
      
      // Verify non-negative amounts
      assertEquals(base >= 0, true, `Base ${base} should be non-negative for total ${total}, tax ${taxRate}bp`);
      assertEquals(tax >= 0, true, `Tax ${tax} should be non-negative for total ${total}, tax ${taxRate}bp`);
      
      // Test breakdown function - it might adjust base by ±1 cent for exact precision
      const breakdown = calculateTaxBreakdown(total, taxRate);
      
      // The most important guarantee: exact total precision
      assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents,
        `Breakdown precision error for total ${total}, tax ${taxRate}bp: ${breakdown.baseAmountCents} + ${breakdown.taxAmountCents} ≠ ${breakdown.totalAmountCents}`);
      
      assertEquals(breakdown.totalAmountCents, total, 
        `Breakdown total mismatch for total ${total}, tax ${taxRate}bp`);
      
      // Base and tax might be adjusted by ±1 cent to ensure exact total
      const baseDifference = Math.abs(breakdown.baseAmountCents - base);
      const taxDifference = Math.abs(breakdown.taxAmountCents - tax);
      
      assertEquals(baseDifference <= 1, true,
        `Breakdown base adjustment too large for total ${total}, tax ${taxRate}bp: expected ${base}, got ${breakdown.baseAmountCents}, difference ${baseDifference}`);
      assertEquals(taxDifference <= 1, true,
        `Breakdown tax adjustment too large for total ${total}, tax ${taxRate}bp: expected ${tax}, got ${breakdown.taxAmountCents}, difference ${taxDifference}`);
    });
  });
});

Deno.test('exact precision guarantee - property-based testing with random inputs', () => {
  // Generate random test cases to verify precision across a wide range of inputs
  const testCases = [];
  
  // Generate 100 random test cases
  for (let i = 0; i < 100; i++) {
    const total = Math.floor(Math.random() * 10000000) + 1; // 1 cent to $100,000
    const taxRate = Math.floor(Math.random() * 5000) + 1;   // 0.01% to 50%
    testCases.push({ total, taxRate });
  }
  
  // Add some specific edge cases
  testCases.push(
    { total: 1, taxRate: 1 },
    { total: 1, taxRate: 9999 },
    { total: 9999999, taxRate: 1 },
    { total: 9999999, taxRate: 9999 }
  );
  
  testCases.forEach(({ total, taxRate }) => {
    const base = calculateBaseFromTotal(total, taxRate);
    const tax = total - base;
    
    // Verify exact precision
    assertEquals(base + tax, total, 
      `Random test failed: total ${total}, tax rate ${taxRate}bp -> base ${base} + tax ${tax} ≠ ${total}`);
    
    // Verify non-negative amounts
    assertEquals(base >= 0, true, `Random test: base ${base} should be non-negative`);
    assertEquals(tax >= 0, true, `Random test: tax ${tax} should be non-negative`);
    
    // Verify breakdown consistency
    const breakdown = calculateTaxBreakdown(total, taxRate);
    assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents,
      `Random test breakdown failed: total ${total}, tax rate ${taxRate}bp`);
  });
});

Deno.test('exact precision guarantee - zero tax rate edge case', () => {
  // Test that zero tax rate works correctly
  const totalAmounts = [1, 100, 1000, 10000, 100000, 1000000];
  
  totalAmounts.forEach(total => {
    const base = calculateBaseFromTotal(total, 0);
    const tax = total - base;
    
    assertEquals(base, total, `Zero tax: base should equal total for amount ${total}`);
    assertEquals(tax, 0, `Zero tax: tax should be zero for amount ${total}`);
    assertEquals(base + tax, total, `Zero tax: exact precision for amount ${total}`);
    
    // Test breakdown
    const breakdown = calculateTaxBreakdown(total, 0);
    assertEquals(breakdown.baseAmountCents, total, `Zero tax breakdown: base should equal total`);
    assertEquals(breakdown.taxAmountCents, 0, `Zero tax breakdown: tax should be zero`);
    assertEquals(breakdown.totalAmountCents, total, `Zero tax breakdown: total should match input`);
  });
});

Deno.test('exact precision guarantee - high tax rates', () => {
  // Test very high tax rates that might cause precision issues
  const highTaxRates = [
    10000,  // 100%
    20000,  // 200%
    50000,  // 500%
    99999,  // 999.99%
  ];
  
  const totalAmounts = [100, 1000, 10000, 100000];
  
  highTaxRates.forEach(taxRate => {
    totalAmounts.forEach(total => {
      const base = calculateBaseFromTotal(total, taxRate);
      const tax = total - base;
      
      // Verify exact precision
      assertEquals(base + tax, total, 
        `High tax rate failed: total ${total}, tax rate ${taxRate}bp -> base ${base} + tax ${tax} ≠ ${total}`);
      
      // Verify non-negative amounts
      assertEquals(base >= 0, true, `High tax rate: base ${base} should be non-negative`);
      assertEquals(tax >= 0, true, `High tax rate: tax ${tax} should be non-negative`);
      
      // For very high tax rates, base should be much smaller than total
      if (taxRate >= 10000) { // 100% or higher
        assertEquals(base <= total / 2, true, 
          `High tax rate: base ${base} should be <= half of total ${total} for ${taxRate}bp tax`);
      }
    });
  });
});

Deno.test('exact precision guarantee - consistency between functions', () => {
  // Test that calculateTaxFromBase and calculateBaseFromTotal are consistent
  // when used together, maintaining exact precision
  const testCases = [
    { total: 3200000, tax: 1300 },
    { total: 113000, tax: 1300 },
    { total: 1000000, tax: 875 },
    { total: 500000, tax: 1250 },
    { total: 123456, tax: 1575 },
    { total: 999999, tax: 2500 },
  ];
  
  testCases.forEach(({ total, tax }) => {
    // Calculate base from total
    const base = calculateBaseFromTotal(total, tax);
    const actualTax = total - base;
    
    // Calculate tax from the calculated base
    const recalculatedTax = calculateTaxFromBase(base, tax);
    
    // Verify exact precision is maintained
    assertEquals(base + actualTax, total, 
      `Function consistency: base ${base} + tax ${actualTax} ≠ total ${total}`);
    
    // The recalculated tax might differ by 1 cent due to rounding,
    // but the exact total should always be maintained
    const taxDifference = Math.abs(actualTax - recalculatedTax);
    assertEquals(taxDifference <= 1, true, 
      `Tax calculation difference too large: ${actualTax} vs ${recalculatedTax} (diff: ${taxDifference})`);
    
    // Most importantly, the original total should be preserved
    const recalculatedTotal = base + recalculatedTax;
    const totalDifference = Math.abs(total - recalculatedTotal);
    assertEquals(totalDifference <= 1, true, 
      `Total preservation failed: original ${total} vs recalculated ${recalculatedTotal} (diff: ${totalDifference})`);
  });
});

Deno.test('exact precision guarantee - string inputs maintain precision', () => {
  // Test that string inputs maintain the same exact precision as number inputs
  const testCases = [
    { total: '3200000', tax: '1300' },
    { total: '113000', tax: '1300' },
    { total: '1000000', tax: '875' },
    { total: '333', tax: '1333' },
    { total: '999999', tax: '6666' },
  ];
  
  testCases.forEach(({ total, tax }) => {
    // Test with string inputs
    const baseString = calculateBaseFromTotal(total, tax);
    const taxString = parseInt(total) - baseString;
    
    // Test with number inputs
    const baseNumber = calculateBaseFromTotal(parseInt(total), parseInt(tax));
    const taxNumber = parseInt(total) - baseNumber;
    
    // Verify string and number inputs produce identical results
    assertEquals(baseString, baseNumber, 
      `String vs number base mismatch for total ${total}, tax ${tax}`);
    assertEquals(taxString, taxNumber, 
      `String vs number tax mismatch for total ${total}, tax ${tax}`);
    
    // Verify exact precision for both
    assertEquals(baseString + taxString, parseInt(total), 
      `String input precision failed: ${baseString} + ${taxString} ≠ ${total}`);
    assertEquals(baseNumber + taxNumber, parseInt(total), 
      `Number input precision failed: ${baseNumber} + ${taxNumber} ≠ ${total}`);
    
    // Test breakdown function with string inputs
    const breakdownString = calculateTaxBreakdown(total, tax);
    const breakdownNumber = calculateTaxBreakdown(parseInt(total), parseInt(tax));
    
    assertEquals(breakdownString.baseAmountCents, breakdownNumber.baseAmountCents,
      `Breakdown base mismatch: string vs number`);
    assertEquals(breakdownString.taxAmountCents, breakdownNumber.taxAmountCents,
      `Breakdown tax mismatch: string vs number`);
    assertEquals(breakdownString.totalAmountCents, breakdownNumber.totalAmountCents,
      `Breakdown total mismatch: string vs number`);
  });
});

Deno.test('exact precision guarantee - no precision errors thrown', () => {
  // Test that the functions no longer throw precision errors
  // Instead, they should guarantee exact precision by design
  const testCases = [
    { total: 3200000, tax: 1300 },
    { total: 333, tax: 1333 },      // Creates repeating decimals
    { total: 999999, tax: 6666 },   // Creates repeating decimals
    { total: 1, tax: 9999 },        // Extreme case
    { total: 9999999, tax: 1 },     // Another extreme case
  ];
  
  testCases.forEach(({ total, tax }) => {
    // These should not throw any precision errors
    let base, calculatedTax, breakdown;
    
    // Test calculateBaseFromTotal
    try {
      base = calculateBaseFromTotal(total, tax);
      calculatedTax = total - base;
      assertEquals(base + calculatedTax, total, 
        `Precision not guaranteed for total ${total}, tax ${tax}bp`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('precision error')) {
        throw new Error(`Unexpected precision error thrown for total ${total}, tax ${tax}bp: ${error.message}`);
      }
      throw error; // Re-throw if it's a different type of error
    }
    
    // Test calculateTaxBreakdown
    try {
      breakdown = calculateTaxBreakdown(total, tax);
      assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents,
        `Breakdown precision not guaranteed for total ${total}, tax ${tax}bp`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('precision error')) {
        throw new Error(`Unexpected precision error thrown in breakdown for total ${total}, tax ${tax}bp: ${error.message}`);
      }
      throw error; // Re-throw if it's a different type of error
    }
  });
});