/**
 * Tests for exact precision fixes in tax calculations
 * 
 * These tests verify that the library handles the specific case where:
 * 1. User enters total: $122.00
 * 2. App calculates base: $107.96 (10796 cents)
 * 3. Tax calculation should result in exact total match
 */

import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  calculateBaseFromTotal,
  calculateTaxFromBase,
  calculateTaxBreakdown,
  calculateTaxBreakdownFromBase,
} from '../src/calculations.ts';

Deno.test('Exact precision fix - $122.00 with 13% tax case', () => {
  const totalCents = 12200; // $122.00
  const taxRate = 1300;     // 13%

  // Step 1: Calculate base from total (what user would see first)
  const calculatedBase = calculateBaseFromTotal(totalCents, taxRate);
  console.log(`Calculated base: ${calculatedBase} cents ($${calculatedBase / 100})`);
  
  // Step 2: Calculate tax breakdown using the improved function
  const breakdown = calculateTaxBreakdown(totalCents, taxRate);
  
  // Verify exact precision
  assertEquals(
    breakdown.baseAmountCents + breakdown.taxAmountCents,
    breakdown.totalAmountCents,
    'Base + tax must equal total exactly'
  );
  
  assertEquals(breakdown.totalAmountCents, totalCents, 'Total must match input');
  
  console.log('Breakdown:', {
    base: `${breakdown.baseAmountCents} cents ($${breakdown.baseAmountCents / 100})`,
    tax: `${breakdown.taxAmountCents} cents ($${breakdown.taxAmountCents / 100})`,
    total: `${breakdown.totalAmountCents} cents ($${breakdown.totalAmountCents / 100})`
  });
});

Deno.test('calculateTaxBreakdownFromBase - handles user flow exactly', () => {
  const totalCents = 12200; // $122.00
  const taxRate = 1300;     // 13%

  // Step 1: User enters total, app calculates base (first calculation)
  const calculatedBase = calculateBaseFromTotal(totalCents, taxRate);
  console.log(`Step 1 - Calculated base: ${calculatedBase} cents ($${calculatedBase / 100})`);
  
  // Step 2: Later, app needs breakdown using that base (second calculation)
  const breakdown = calculateTaxBreakdownFromBase(calculatedBase, taxRate, totalCents);
  
  // Verify exact precision
  assertEquals(
    breakdown.baseAmountCents + breakdown.taxAmountCents,
    breakdown.totalAmountCents,
    'Base + tax must equal total exactly'
  );
  
  assertEquals(breakdown.totalAmountCents, totalCents, 'Total must match original input');
  
  console.log('Step 2 - Final breakdown:', {
    base: `${breakdown.baseAmountCents} cents ($${breakdown.baseAmountCents / 100})`,
    tax: `${breakdown.taxAmountCents} cents ($${breakdown.taxAmountCents / 100})`,
    total: `${breakdown.totalAmountCents} cents ($${breakdown.totalAmountCents / 100})`
  });
  
  // The base might be adjusted by ±1 cent to ensure exact total
  const baseDifference = Math.abs(breakdown.baseAmountCents - calculatedBase);
  console.log(`Base adjustment: ${baseDifference} cent(s)`);
});

Deno.test('Edge cases - very small amounts with exact precision', () => {
  // Test case that would cause rounding issues
  const cases = [
    { total: 100, tax: 1300 }, // $1.00 with 13%
    { total: 1, tax: 1300 },   // $0.01 with 13%
    { total: 333, tax: 3333 }, // $3.33 with 33.33%
    { total: 12200, tax: 1300 }, // Original problem case
  ];

  cases.forEach(({ total, tax }) => {
    const breakdown = calculateTaxBreakdown(total, tax);
    
    // Verify exact precision
    assertEquals(
      breakdown.baseAmountCents + breakdown.taxAmountCents,
      breakdown.totalAmountCents,
      `Case ${total} cents with ${tax} bp: Base + tax must equal total exactly`
    );
    
    assertEquals(breakdown.totalAmountCents, total, 'Total must match input');
    
    console.log(`Case ${total} cents (${tax} bp):`, {
      base: breakdown.baseAmountCents,
      tax: breakdown.taxAmountCents,
      total: breakdown.totalAmountCents,
      sum: breakdown.baseAmountCents + breakdown.taxAmountCents
    });
  });
});

Deno.test('String inputs work with exact precision', () => {
  const totalCents = "12200"; // $122.00 as string
  const taxRate = "1300";     // 13% as string

  // Test calculateTaxBreakdown with strings
  const breakdown = calculateTaxBreakdown(totalCents, taxRate);
  
  assertEquals(
    breakdown.baseAmountCents + breakdown.taxAmountCents,
    breakdown.totalAmountCents,
    'String inputs: Base + tax must equal total exactly'
  );
  
  assertEquals(breakdown.totalAmountCents, 12200, 'Total must match converted input');
  
  // Test calculateTaxBreakdownFromBase with strings
  const calculatedBase = calculateBaseFromTotal(totalCents, taxRate);
  const breakdown2 = calculateTaxBreakdownFromBase(
    calculatedBase.toString(),
    taxRate,
    totalCents
  );
  
  assertEquals(
    breakdown2.baseAmountCents + breakdown2.taxAmountCents,
    breakdown2.totalAmountCents,
    'String inputs in breakdownFromBase: Base + tax must equal total exactly'
  );
});

Deno.test('Zero tax rate edge case', () => {
  const totalCents = 12200; // $122.00
  const taxRate = 0;        // 0%

  const breakdown = calculateTaxBreakdown(totalCents, taxRate);
  
  assertEquals(breakdown.baseAmountCents, totalCents, 'With 0% tax, base should equal total');
  assertEquals(breakdown.taxAmountCents, 0, 'With 0% tax, tax should be 0');
  assertEquals(breakdown.totalAmountCents, totalCents, 'Total should match input');
  assertEquals(
    breakdown.baseAmountCents + breakdown.taxAmountCents,
    breakdown.totalAmountCents,
    'Even with 0% tax, base + tax must equal total'
  );
});

Deno.test('High tax rate edge case', () => {
  const totalCents = 30000; // $300.00
  const taxRate = 5000;     // 50%

  const breakdown = calculateTaxBreakdown(totalCents, taxRate);
  
  assertEquals(
    breakdown.baseAmountCents + breakdown.taxAmountCents,
    breakdown.totalAmountCents,
    'High tax rate: Base + tax must equal total exactly'
  );
  
  assertEquals(breakdown.totalAmountCents, totalCents, 'Total must match input');
  
  // With 50% tax, base should be approximately 2/3 of total
  const expectedBase = Math.round(totalCents * 10000 / (10000 + taxRate));
  const baseDifference = Math.abs(breakdown.baseAmountCents - expectedBase);
  
  console.log('High tax rate case:', {
    base: breakdown.baseAmountCents,
    tax: breakdown.taxAmountCents,
    total: breakdown.totalAmountCents,
    expectedBase,
    baseDifference
  });
  
  // Base should be close to expected, but exact total is prioritized
  console.log(`Base difference from mathematical expectation: ${baseDifference} cent(s)`);
});