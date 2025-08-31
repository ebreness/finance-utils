/**
 * Equivalence and Integration Tests for String Input Support
 * 
 * This test suite verifies:
 * 1. Identical results for equivalent string and number inputs
 * 2. Real-world scenarios with form data and API responses
 * 3. Chains of operations using string inputs
 * 4. Performance tests for string conversion overhead
 * 5. Backward compatibility verification
 */

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  calculateTaxFromBase,
  calculateBaseFromTotal,
  calculateTaxBreakdown,
  decimalToCents,
  centsToDecimal,
  percent100ToBasisPoints,
  percent1ToBasisPoints,
  basisPointsToPercent100,
  formatCentsWithCurrency,
  formatPercentWithSymbol,
} from '../mod.ts';

// Test data representing real-world scenarios
const REAL_WORLD_SCENARIOS = [
  {
    name: "Small purchase with HST",
    totalAmount: "15.25",
    taxRate: "13",
    expectedBase: 1350,
    expectedTax: 175,
    expectedTotal: 1525
  },
  {
    name: "Restaurant bill with tip calculation base",
    totalAmount: "127.80",
    taxRate: "13",
    expectedBase: 11310,
    expectedTax: 1470,
    expectedTotal: 12780
  },
  {
    name: "Large service contract",
    totalAmount: "32000.00",
    taxRate: "13",
    expectedBase: 2831858,
    expectedTax: 368142,
    expectedTotal: 3200000
  },
  {
    name: "Subscription service monthly",
    totalAmount: "99.99",
    taxRate: "5",
    expectedBase: 9523,
    expectedTax: 476,
    expectedTotal: 9999
  },
  {
    name: "High-value B2B transaction",
    totalAmount: "125000.00",
    taxRate: "15",
    expectedBase: 10869565,
    expectedTax: 1630435,
    expectedTotal: 12500000
  }
];

// Form data simulation - strings with various formatting
const FORM_DATA_INPUTS = [
  { input: "123.45", expected: 12345 },
  { input: " 123.45 ", expected: 12345 },
  { input: "0.01", expected: 1 },
  { input: "1000.00", expected: 100000 },
  { input: "999.99", expected: 99999 },
  { input: "0", expected: 0 },
  { input: "1", expected: 100 },
  { input: "10", expected: 1000 },
  { input: "100", expected: 10000 }
];

// API response simulation - mixed data types
const API_RESPONSE_SCENARIOS = [
  {
    name: "E-commerce checkout API",
    data: {
      subtotal: "299.99" as string,
      taxRate: "8.75" as string,
      shipping: "15.00" as string
    }
  },
  {
    name: "Invoice processing API",
    data: {
      lineItems: ["125.50", "75.25", "200.00"] as string[],
      taxRate: "13" as string
    }
  },
  {
    name: "Payroll calculation API",
    data: {
      grossPay: "5000.00" as string,
      deductionRate: "22.5" as string
    }
  }
];

Deno.test("Equivalence - All functions produce identical results for string vs number inputs", () => {
  const testCases = [
    { amount: 100000, rate: 1300 },
    { amount: 3200000, rate: 1300 },
    { amount: 1525, rate: 1300 },
    { amount: 99999, rate: 500 },
    { amount: 12500000, rate: 1500 },
    { amount: 1, rate: 1000 },
    { amount: 0, rate: 1300 }
  ];

  testCases.forEach(({ amount, rate }) => {
    // Test calculateTaxFromBase equivalence
    const taxFromBaseNumber = calculateTaxFromBase(amount, rate);
    const taxFromBaseString = calculateTaxFromBase(amount.toString(), rate.toString());
    assertEquals(taxFromBaseString, taxFromBaseNumber, 
      `calculateTaxFromBase failed equivalence for amount=${amount}, rate=${rate}`);

    // Test calculateBaseFromTotal equivalence
    const baseFromTotalNumber = calculateBaseFromTotal(amount, rate);
    const baseFromTotalString = calculateBaseFromTotal(amount.toString(), rate.toString());
    assertEquals(baseFromTotalString, baseFromTotalNumber,
      `calculateBaseFromTotal failed equivalence for amount=${amount}, rate=${rate}`);

    // Test calculateTaxBreakdown equivalence
    const breakdownNumber = calculateTaxBreakdown(amount, rate);
    const breakdownString = calculateTaxBreakdown(amount.toString(), rate.toString());
    assertEquals(breakdownString.baseAmountCents, breakdownNumber.baseAmountCents,
      `calculateTaxBreakdown base failed equivalence for amount=${amount}, rate=${rate}`);
    assertEquals(breakdownString.taxAmountCents, breakdownNumber.taxAmountCents,
      `calculateTaxBreakdown tax failed equivalence for amount=${amount}, rate=${rate}`);
    assertEquals(breakdownString.totalAmountCents, breakdownNumber.totalAmountCents,
      `calculateTaxBreakdown total failed equivalence for amount=${amount}, rate=${rate}`);
  });
});

Deno.test("Equivalence - Conversion functions produce identical results", () => {
  const decimalTestCases = [0, 1, 1.23, 123.45, 0.01, 0.99, 1000.00, 32000.00];
  const percentTestCases = [0, 1, 13, 25.5, 100, 0.01, 8.75, 15.75];

  // Test decimalToCents equivalence
  decimalTestCases.forEach(value => {
    const numberResult = decimalToCents(value);
    const stringResult = decimalToCents(value.toString());
    assertEquals(stringResult, numberResult, 
      `decimalToCents failed equivalence for ${value}`);
  });

  // Test percent100ToBasisPoints equivalence
  percentTestCases.forEach(value => {
    const numberResult = percent100ToBasisPoints(value);
    const stringResult = percent100ToBasisPoints(value.toString());
    assertEquals(stringResult, numberResult, 
      `percent100ToBasisPoints failed equivalence for ${value}`);
  });

  // Test percent1ToBasisPoints equivalence
  const percent1TestCases = percentTestCases.map(v => v / 100);
  percent1TestCases.forEach(value => {
    const numberResult = percent1ToBasisPoints(value);
    const stringResult = percent1ToBasisPoints(value.toString());
    assertEquals(stringResult, numberResult, 
      `percent1ToBasisPoints failed equivalence for ${value}`);
  });
});

Deno.test("Real-world scenarios - Form data processing", () => {
  FORM_DATA_INPUTS.forEach(({ input, expected }) => {
    const result = decimalToCents(input);
    assertEquals(result, expected, 
      `Form input "${input}" should convert to ${expected} cents`);
  });

  // Test form data with tax calculations
  const formTotal = "127.80"; // Restaurant bill
  const formTaxRate = "13";   // HST rate
  
  const totalCents = decimalToCents(formTotal);
  const taxRateBp = percent100ToBasisPoints(formTaxRate);
  const breakdown = calculateTaxBreakdown(totalCents, taxRateBp);
  assertEquals(breakdown.totalAmountCents, 12780);
  assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents);
  
  // Verify the calculation is correct
  const expectedBase = calculateBaseFromTotal(12780, 1300);
  assertEquals(breakdown.baseAmountCents, expectedBase);
});

Deno.test("Real-world scenarios - API response processing", () => {
  // E-commerce checkout scenario
  const checkoutData = API_RESPONSE_SCENARIOS[0]!.data;
  const subtotalCents = decimalToCents(checkoutData.subtotal!);
  const taxRateBp = percent100ToBasisPoints(checkoutData.taxRate!);
  const shippingCents = decimalToCents(checkoutData.shipping!);
  
  const taxOnSubtotal = calculateTaxFromBase(subtotalCents, taxRateBp);
  const totalWithTax = subtotalCents + taxOnSubtotal + shippingCents;
  
  assertEquals(subtotalCents, 29999); // $299.99
  assertEquals(taxRateBp, 875);       // 8.75%
  assertEquals(shippingCents, 1500);  // $15.00
  assertEquals(taxOnSubtotal, 2625);  // $26.25 tax
  assertEquals(totalWithTax, 34124);  // $341.24 total

  // Invoice processing scenario
  const invoiceData = API_RESPONSE_SCENARIOS[1]!.data;
  const lineItemsCents = invoiceData.lineItems!.map(item => decimalToCents(item));
  const invoiceTaxRate = percent100ToBasisPoints(invoiceData.taxRate!);
  
  const subtotal = lineItemsCents.reduce((sum, item) => sum + item, 0);
  const invoiceBreakdown = calculateTaxBreakdown(subtotal + calculateTaxFromBase(subtotal, invoiceTaxRate), invoiceTaxRate);
  
  assertEquals(lineItemsCents, [12550, 7525, 20000]); // Individual items
  assertEquals(subtotal, 40075); // $400.75 subtotal
  assertEquals(invoiceTaxRate, 1300); // 13%
  assertEquals(invoiceBreakdown.baseAmountCents, subtotal);
});

Deno.test("Real-world scenarios - Complete workflow validation", () => {
  REAL_WORLD_SCENARIOS.forEach(scenario => {
    const totalCents = decimalToCents(scenario.totalAmount);
    const taxRateBp = percent100ToBasisPoints(scenario.taxRate);
    
    const breakdown = calculateTaxBreakdown(totalCents, taxRateBp);
    
    assertEquals(breakdown.totalAmountCents, scenario.expectedTotal, 
      `${scenario.name}: Total amount mismatch`);
    assertEquals(breakdown.baseAmountCents, scenario.expectedBase, 
      `${scenario.name}: Base amount mismatch`);
    assertEquals(breakdown.taxAmountCents, scenario.expectedTax, 
      `${scenario.name}: Tax amount mismatch`);
    
    // Verify exact precision
    assertEquals(breakdown.baseAmountCents + breakdown.taxAmountCents, breakdown.totalAmountCents,
      `${scenario.name}: Precision error - base + tax ≠ total`);
    
    // Verify formatting works correctly
    const formattedTotal = formatCentsWithCurrency(breakdown.totalAmountCents);
    const formattedBase = formatCentsWithCurrency(breakdown.baseAmountCents);
    const formattedTax = formatCentsWithCurrency(breakdown.taxAmountCents);
    const formattedRate = formatPercentWithSymbol(basisPointsToPercent100(taxRateBp));
    
    // Basic format validation (should not throw)
    assertEquals(typeof formattedTotal, 'string');
    assertEquals(typeof formattedBase, 'string');
    assertEquals(typeof formattedTax, 'string');
    assertEquals(typeof formattedRate, 'string');
  });
});

Deno.test("Chain operations - Complex calculation workflows with strings", () => {
  // Scenario: Multi-step invoice calculation with discounts and multiple tax rates
  const originalAmount = "1000.00";
  const discountPercent = "10";      // 10% discount
  const federalTaxRate = "5";        // 5% GST
  const provincialTaxRate = "8";     // 8% PST
  
  // Step 1: Convert inputs
  const originalCents = decimalToCents(originalAmount);
  const discountBp = percent100ToBasisPoints(discountPercent);
  const federalBp = percent100ToBasisPoints(federalTaxRate);
  const provincialBp = percent100ToBasisPoints(provincialTaxRate);
  
  // Step 2: Apply discount
  const discountAmount = calculateTaxFromBase(originalCents, discountBp);
  const discountedAmount = originalCents - discountAmount;
  
  // Step 3: Calculate federal tax on discounted amount
  const federalTax = calculateTaxFromBase(discountedAmount, federalBp);
  
  // Step 4: Calculate provincial tax on discounted amount
  const provincialTax = calculateTaxFromBase(discountedAmount, provincialBp);
  
  // Step 5: Calculate final total
  const finalTotal = discountedAmount + federalTax + provincialTax;
  
  // Verify calculations
  assertEquals(originalCents, 100000);    // $1000.00
  assertEquals(discountAmount, 10000);    // $100.00 discount
  assertEquals(discountedAmount, 90000);  // $900.00 after discount
  assertEquals(federalTax, 4500);         // $45.00 GST
  assertEquals(provincialTax, 7200);      // $72.00 PST
  assertEquals(finalTotal, 101700);       // $1017.00 final total
  
  // Verify we can work backwards
  const totalBreakdown = calculateTaxBreakdown(finalTotal.toString(), "13"); // Combined 13% for comparison
  assertEquals(typeof totalBreakdown.baseAmountCents, 'number');
  assertEquals(totalBreakdown.totalAmountCents, finalTotal);
});

Deno.test("Chain operations - E-commerce cart calculation", () => {
  // Simulate shopping cart with multiple items, shipping, and taxes
  const cartItems = [
    { price: "29.99", quantity: "2" },
    { price: "15.50", quantity: "1" },
    { price: "75.00", quantity: "3" }
  ];
  const shippingCost = "12.99";
  const taxRate = "13";
  
  // Calculate subtotal
  let subtotalCents = 0;
  cartItems.forEach(item => {
    const itemPrice = decimalToCents(item.price);
    const quantity = parseInt(item.quantity);
    subtotalCents += itemPrice * quantity;
  });
  
  // Add shipping
  const shippingCents = decimalToCents(shippingCost);
  const subtotalWithShipping = subtotalCents + shippingCents;
  
  // Calculate tax on subtotal + shipping
  const taxRateBp = percent100ToBasisPoints(taxRate);
  const taxAmount = calculateTaxFromBase(subtotalWithShipping, taxRateBp);
  const finalTotal = subtotalWithShipping + taxAmount;
  
  // Verify calculations
  assertEquals(subtotalCents, 30048);        // $300.48 (items only)
  assertEquals(shippingCents, 1299);         // $12.99 shipping
  assertEquals(subtotalWithShipping, 31347); // $313.47 subtotal + shipping
  assertEquals(taxAmount, 4075);             // $40.75 tax
  assertEquals(finalTotal, 35422);           // $354.22 final total
  
  // Verify precision by working backwards
  const breakdown = calculateTaxBreakdown(finalTotal, taxRateBp);
  assertEquals(breakdown.baseAmountCents, subtotalWithShipping);
  assertEquals(breakdown.taxAmountCents, taxAmount);
  assertEquals(breakdown.totalAmountCents, finalTotal);
});

Deno.test("Performance - String conversion overhead is minimal", () => {
  const iterations = 10000;
  const testAmount = 3200000;
  const testRate = 1300;
  
  // Measure number-only operations
  const numberStartTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    calculateTaxBreakdown(testAmount, testRate);
  }
  const numberEndTime = performance.now();
  const numberDuration = numberEndTime - numberStartTime;
  
  // Measure string operations
  const stringStartTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    calculateTaxBreakdown(testAmount.toString(), testRate.toString());
  }
  const stringEndTime = performance.now();
  const stringDuration = stringEndTime - stringStartTime;
  
  // Calculate overhead percentage
  const overhead = ((stringDuration - numberDuration) / numberDuration) * 100;
  
  console.log(`Performance test results (${iterations} iterations):`);
  console.log(`Number operations: ${numberDuration.toFixed(2)}ms`);
  console.log(`String operations: ${stringDuration.toFixed(2)}ms`);
  console.log(`Overhead: ${overhead.toFixed(2)}%`);
  
  // Verify overhead is reasonable (less than 50% for string conversion)
  assertEquals(overhead < 50, true, 
    `String conversion overhead (${overhead.toFixed(2)}%) should be less than 50%`);
  
  // Verify both produce same results
  const numberResult = calculateTaxBreakdown(testAmount, testRate);
  const stringResult = calculateTaxBreakdown(testAmount.toString(), testRate.toString());
  assertEquals(stringResult.baseAmountCents, numberResult.baseAmountCents);
  assertEquals(stringResult.taxAmountCents, numberResult.taxAmountCents);
  assertEquals(stringResult.totalAmountCents, numberResult.totalAmountCents);
});

Deno.test("Performance - Bulk string conversion operations", () => {
  // Test performance with various string formats
  const testData = [
    "1000.00", "2500.50", "999.99", "0.01", "123.45",
    " 1000.00 ", " 2500.50 ", " 999.99 ", " 0.01 ", " 123.45 ",
    "10000", "25000", "99999", "1", "12345"
  ];
  
  const iterations = 1000;
  
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    testData.forEach(amount => {
      const cents = decimalToCents(amount);
      const breakdown = calculateTaxBreakdown(cents, "1300");
      // Verify result is valid
      assertEquals(typeof breakdown.baseAmountCents, 'number');
    });
  }
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Bulk string operations: ${duration.toFixed(2)}ms for ${iterations * testData.length} conversions`);
  console.log(`Average per conversion: ${(duration / (iterations * testData.length)).toFixed(4)}ms`);
  
  // Verify performance is reasonable (less than 1ms per conversion on average)
  const avgPerConversion = duration / (iterations * testData.length);
  assertEquals(avgPerConversion < 1, true, 
    `Average conversion time (${avgPerConversion.toFixed(4)}ms) should be less than 1ms`);
});

Deno.test("Backward compatibility - Existing number-only code continues to work", () => {
  // Test that all existing number-based operations work exactly as before
  const testCases = [
    { amount: 100000, rate: 1300, expectedTax: 13000 },
    { amount: 3200000, rate: 1300, expectedBase: 2831858 },
    { amount: 113000, rate: 1300, expectedBreakdown: { base: 100000, tax: 13000, total: 113000 } }
  ];
  
  testCases.forEach(({ amount, rate, expectedTax, expectedBase, expectedBreakdown }) => {
    if (expectedTax !== undefined) {
      const tax = calculateTaxFromBase(amount, rate);
      assertEquals(tax, expectedTax, `calculateTaxFromBase backward compatibility failed`);
    }
    
    if (expectedBase !== undefined) {
      const base = calculateBaseFromTotal(amount, rate);
      assertEquals(base, expectedBase, `calculateBaseFromTotal backward compatibility failed`);
    }
    
    if (expectedBreakdown !== undefined) {
      const breakdown = calculateTaxBreakdown(amount, rate);
      assertEquals(breakdown.baseAmountCents, expectedBreakdown.base, 
        `calculateTaxBreakdown base backward compatibility failed`);
      assertEquals(breakdown.taxAmountCents, expectedBreakdown.tax, 
        `calculateTaxBreakdown tax backward compatibility failed`);
      assertEquals(breakdown.totalAmountCents, expectedBreakdown.total, 
        `calculateTaxBreakdown total backward compatibility failed`);
    }
  });
  
  // Test conversion functions backward compatibility
  assertEquals(decimalToCents(123.45), 12345);
  assertEquals(centsToDecimal(12345), 123.45);
  assertEquals(percent100ToBasisPoints(13), 1300);
  assertEquals(basisPointsToPercent100(1300), 13);
  
  // Test that error handling remains the same for number inputs
  assertThrows(() => calculateTaxFromBase(-100, 1300), Error, "cannot be negative");
  assertThrows(() => calculateBaseFromTotal(NaN, 1300), Error, "cannot be NaN");
  assertThrows(() => decimalToCents(Infinity), Error, "must be finite");
});

Deno.test("Mixed input scenarios - String and number combinations", () => {
  // Test all possible combinations of string/number inputs
  const amount = 3200000;
  const rate = 1300;
  const expectedBase = 2831858;
  const expectedTax = 368142;
  
  // calculateTaxFromBase combinations
  assertEquals(calculateTaxFromBase(expectedBase, rate), expectedTax);
  assertEquals(calculateTaxFromBase(expectedBase.toString(), rate), expectedTax);
  assertEquals(calculateTaxFromBase(expectedBase, rate.toString()), expectedTax);
  assertEquals(calculateTaxFromBase(expectedBase.toString(), rate.toString()), expectedTax);
  
  // calculateBaseFromTotal combinations
  assertEquals(calculateBaseFromTotal(amount, rate), expectedBase);
  assertEquals(calculateBaseFromTotal(amount.toString(), rate), expectedBase);
  assertEquals(calculateBaseFromTotal(amount, rate.toString()), expectedBase);
  assertEquals(calculateBaseFromTotal(amount.toString(), rate.toString()), expectedBase);
  
  // calculateTaxBreakdown combinations
  const testBreakdown = (result: any) => {
    assertEquals(result.baseAmountCents, expectedBase);
    assertEquals(result.taxAmountCents, expectedTax);
    assertEquals(result.totalAmountCents, amount);
  };
  
  testBreakdown(calculateTaxBreakdown(amount, rate));
  testBreakdown(calculateTaxBreakdown(amount.toString(), rate));
  testBreakdown(calculateTaxBreakdown(amount, rate.toString()));
  testBreakdown(calculateTaxBreakdown(amount.toString(), rate.toString()));
  
  // Conversion function combinations
  const decimal = 123.45;
  const percent = 13;
  
  assertEquals(decimalToCents(decimal), decimalToCents(decimal.toString()));
  assertEquals(percent100ToBasisPoints(percent), percent100ToBasisPoints(percent.toString()));
});

Deno.test("Error handling consistency - String vs number error messages", () => {
  // Test that error handling is consistent between string and number inputs
  
  // Negative values
  assertThrows(() => calculateTaxFromBase(-100, 1300), Error, "cannot be negative");
  assertThrows(() => calculateTaxFromBase("-100", 1300), Error, "cannot be negative");
  
  // NaN values (only applicable to numbers, strings have different validation)
  assertThrows(() => calculateTaxFromBase(NaN, 1300), Error, "cannot be NaN");
  assertThrows(() => calculateTaxFromBase("abc", 1300), Error, "is not a valid number");
  
  // Infinity values
  assertThrows(() => calculateTaxFromBase(Infinity, 1300), Error, "must be finite");
  // String equivalent would be a very large number string, but that's handled by overflow protection
  
  // Empty/invalid strings
  assertThrows(() => calculateTaxFromBase("", 1300), Error, "cannot be empty string");
  assertThrows(() => calculateTaxFromBase("   ", 1300), Error, "cannot be empty string");
  assertThrows(() => calculateTaxFromBase("12.34.56", 1300), Error, "is not a valid number");
  
  // Verify error messages include original string values for debugging
  try {
    calculateTaxFromBase("invalid", 1300);
    assertEquals(false, true, "Should have thrown an error");
  } catch (error) {
    assertEquals((error as Error).message.includes("invalid"), true, 
      "Error message should include original string value");
  }
});

Deno.test("Integration - Complete financial workflow with string inputs", () => {
  // Simulate a complete financial application workflow
  const invoiceData = {
    lineItems: [
      { description: "Consulting Services", amount: "2500.00", taxable: true },
      { description: "Software License", amount: "1200.00", taxable: true },
      { description: "Training Materials", amount: "350.50", taxable: false },
      { description: "Travel Expenses", amount: "750.25", taxable: true }
    ],
    taxRate: "13",
    discountPercent: "5"
  };
  
  // Step 1: Calculate taxable subtotal
  let taxableSubtotal = 0;
  let nonTaxableSubtotal = 0;
  
  invoiceData.lineItems.forEach(item => {
    const amountCents = decimalToCents(item.amount);
    if (item.taxable) {
      taxableSubtotal += amountCents;
    } else {
      nonTaxableSubtotal += amountCents;
    }
  });
  
  // Step 2: Apply discount to taxable items only
  const discountBp = percent100ToBasisPoints(invoiceData.discountPercent);
  const discountAmount = calculateTaxFromBase(taxableSubtotal, discountBp);
  const discountedTaxableSubtotal = taxableSubtotal - discountAmount;
  
  // Step 3: Calculate tax on discounted taxable amount
  const taxRateBp = percent100ToBasisPoints(invoiceData.taxRate);
  const taxAmount = calculateTaxFromBase(discountedTaxableSubtotal, taxRateBp);
  
  // Step 4: Calculate final total
  const finalTotal = discountedTaxableSubtotal + nonTaxableSubtotal + taxAmount;
  
  // Verify calculations
  assertEquals(taxableSubtotal, 445025);        // $4,450.25 taxable items
  assertEquals(nonTaxableSubtotal, 35050);      // $350.50 non-taxable items
  assertEquals(discountAmount, 22251);          // $222.51 discount (5% of taxable)
  assertEquals(discountedTaxableSubtotal, 422774); // $4,227.74 after discount
  assertEquals(taxAmount, 54961);               // $549.61 tax
  assertEquals(finalTotal, 512785);            // $5,127.85 final total
  
  // Step 5: Verify we can format everything properly
  const formattedSubtotal = formatCentsWithCurrency(taxableSubtotal + nonTaxableSubtotal);
  const formattedDiscount = formatCentsWithCurrency(discountAmount);
  const formattedTax = formatCentsWithCurrency(taxAmount);
  const formattedTotal = formatCentsWithCurrency(finalTotal);
  
  assertEquals(typeof formattedSubtotal, 'string');
  assertEquals(typeof formattedDiscount, 'string');
  assertEquals(typeof formattedTax, 'string');
  assertEquals(typeof formattedTotal, 'string');
  
  // Step 6: Verify precision is maintained throughout
  const reconstructedTotal = discountedTaxableSubtotal + nonTaxableSubtotal + taxAmount;
  assertEquals(reconstructedTotal, finalTotal, "Precision should be maintained throughout calculation");
});