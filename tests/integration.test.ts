/**
 * Integration test to verify module exports work correctly
 */

import { 
  validateAmountCents, 
  validateBasisPoints, 
  checkSafeOperation,
  decimalToCents,
  centsToDecimal,
  percent100ToBasisPoints,
  basisPointsToPercent100,
  formatCentsToNumber,
  formatCentsWithCurrency,
  formatPercentWithSymbol,
  clampPercent01,
  clampPercent0100,
  calculateTaxFromBase,
  calculateBaseFromTotal,
  calculateTaxBreakdown
} from '../mod.ts';
import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Module exports - validation functions work", () => {
  // Test that exported functions work correctly
  assertEquals(validateAmountCents(12345), 12345);
  assertEquals(validateBasisPoints(1300), 1300);
  
  // Test that they throw errors appropriately
  assertThrows(() => validateAmountCents(-1), Error, "Amount cannot be negative");
  assertThrows(() => validateBasisPoints(-1), Error, "Basis points cannot be negative");
  
  // Test checkSafeOperation doesn't throw for safe operations
  checkSafeOperation(100, 200, "addition");
});

Deno.test("Module exports - conversion functions work", () => {
  // Test decimal to cents conversion
  assertEquals(decimalToCents(123.45), 12345);
  assertEquals(centsToDecimal(12345), 123.45);
  
  // Test percentage conversions
  assertEquals(percent100ToBasisPoints(13), 1300);
  assertEquals(basisPointsToPercent100(1300), 13);
  
  // Test round-trip conversion maintains precision
  const originalAmount = 32000.00;
  const cents = decimalToCents(originalAmount);
  const backToDecimal = centsToDecimal(cents);
  assertEquals(backToDecimal, originalAmount);
  
  // Test percentage round-trip
  const originalPercent = 13;
  const basisPoints = percent100ToBasisPoints(originalPercent);
  const backToPercent = basisPointsToPercent100(basisPoints);
  assertEquals(backToPercent, originalPercent);
});

Deno.test("Module exports - formatting functions work", () => {
  // Test number formatting
  assertEquals(formatCentsToNumber(12345), 123.45);
  assertEquals(formatCentsToNumber(100), 1.00);
  
  // Test currency formatting
  assertEquals(formatCentsWithCurrency(12345), '$123.45');
  assertEquals(formatCentsWithCurrency(12345, '€'), '€123.45');
  
  // Test percentage formatting
  assertEquals(formatPercentWithSymbol(13.456), '13.46%');
  assertEquals(formatPercentWithSymbol(0.13), '0.13%');
  
  // Test clamping functions
  assertEquals(clampPercent01(1.5), 1);
  assertEquals(clampPercent01(-0.1), 0);
  assertEquals(clampPercent01(0.5), 0.5);
  
  assertEquals(clampPercent0100(150), 100);
  assertEquals(clampPercent0100(-10), 0);
  assertEquals(clampPercent0100(50), 50);
});

Deno.test("Module exports - tax calculation functions work", () => {
  // Test calculateTaxFromBase
  assertEquals(calculateTaxFromBase(100000, 1300), 13000); // $1000 * 13% = $130
  assertEquals(calculateTaxFromBase(2831858, 1300), 368142); // From requirements example
  
  // Test calculateBaseFromTotal
  assertEquals(calculateBaseFromTotal(113000, 1300), 100000); // $1130 with 13% tax = $1000 base
  assertEquals(calculateBaseFromTotal(3200000, 1300), 2831858); // Requirements example
  
  // Test calculateTaxBreakdown
  const breakdown = calculateTaxBreakdown(3200000, 1300);
  assertEquals(breakdown.baseAmountCents, 2831858);
  assertEquals(breakdown.taxAmountCents, 368142);
  assertEquals(breakdown.totalAmountCents, 3200000);
  assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents);
  
  // Test consistency between functions
  const baseFromTotal = calculateBaseFromTotal(113000, 1300);
  const taxFromBase = calculateTaxFromBase(baseFromTotal, 1300);
  const breakdownResult = calculateTaxBreakdown(113000, 1300);
  
  assertEquals(breakdownResult.baseAmountCents, baseFromTotal);
  assertEquals(breakdownResult.baseAmountCents + breakdownResult.taxAmountCents, 113000);
  
  // Tax amounts might differ by 1 cent due to rounding, but total should be exact
  const taxDifference = Math.abs(breakdownResult.taxAmountCents - taxFromBase);
  assertEquals(taxDifference <= 1, true);
});

Deno.test("Module exports - complete financial calculation workflow", () => {
  // Test a complete workflow: decimal input -> calculations -> formatting
  const originalAmount = 32000.00; // $32,000.00
  const taxRate = 13; // 13%
  
  // Convert inputs to internal format
  const totalCents = decimalToCents(originalAmount);
  const taxBasisPoints = percent100ToBasisPoints(taxRate);
  
  // Perform tax breakdown
  const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);
  
  // Format results for display
  const formattedTotal = formatCentsWithCurrency(breakdown.totalAmountCents);
  const formattedBase = formatCentsWithCurrency(breakdown.baseAmountCents);
  const formattedTax = formatCentsWithCurrency(breakdown.taxAmountCents);
  const formattedTaxRate = formatPercentWithSymbol(basisPointsToPercent100(taxBasisPoints));
  
  // Verify the complete workflow
  assertEquals(formattedTotal, '$32,000.00');
  assertEquals(formattedBase, '$28,318.58');
  assertEquals(formattedTax, '$3,681.42');
  assertEquals(formattedTaxRate, '13.00%');
  
  // Verify precision is maintained throughout
  assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents);
  assertEquals(centsToDecimal(breakdown.totalAmountCents), originalAmount);
});

// String input backward compatibility tests
Deno.test("Module exports - string input backward compatibility", () => {
  // Test that string inputs work with all exported functions
  assertEquals(validateAmountCents("12345"), 12345);
  assertEquals(validateBasisPoints("1300"), 1300);
  
  // Test conversion functions with string inputs
  assertEquals(decimalToCents("123.45"), 12345);
  assertEquals(percent100ToBasisPoints("13"), 1300);
  
  // Test calculation functions with string inputs
  assertEquals(calculateTaxFromBase("100000", "1300"), 13000);
  assertEquals(calculateBaseFromTotal("113000", "1300"), 100000);
  
  const stringBreakdown = calculateTaxBreakdown("113000", "1300");
  assertEquals(stringBreakdown.baseAmountCents, 100000);
  assertEquals(stringBreakdown.taxAmountCents, 13000);
  assertEquals(stringBreakdown.totalAmountCents, 113000);
});

Deno.test("Module exports - mixed string/number inputs", () => {
  // Test mixed inputs produce same results as pure number inputs
  const numberResult = calculateTaxBreakdown(3200000, 1300);
  const mixedResult1 = calculateTaxBreakdown("3200000", 1300);
  const mixedResult2 = calculateTaxBreakdown(3200000, "1300");
  const stringResult = calculateTaxBreakdown("3200000", "1300");
  
  assertEquals(mixedResult1.baseAmountCents, numberResult.baseAmountCents);
  assertEquals(mixedResult2.baseAmountCents, numberResult.baseAmountCents);
  assertEquals(stringResult.baseAmountCents, numberResult.baseAmountCents);
  
  assertEquals(mixedResult1.taxAmountCents, numberResult.taxAmountCents);
  assertEquals(mixedResult2.taxAmountCents, numberResult.taxAmountCents);
  assertEquals(stringResult.taxAmountCents, numberResult.taxAmountCents);
});

Deno.test("Module exports - string input error handling", () => {
  // Test that string input errors are descriptive
  assertThrows(() => validateAmountCents(""), Error, "cannot be empty string");
  assertThrows(() => validateAmountCents("abc"), Error, "is not a valid number");
  assertThrows(() => decimalToCents("invalid"), Error, "is not a valid number");
  assertThrows(() => calculateTaxFromBase("", "1300"), Error, "cannot be empty string");
  assertThrows(() => calculateTaxFromBase("invalid", "1300"), Error, "is not a valid number");
});