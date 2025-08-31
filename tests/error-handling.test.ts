/**
 * Comprehensive error handling tests for string input support
 * This file focuses on testing error scenarios and edge cases for string inputs
 * across all functions that support StringOrNumber parameters.
 */

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  convertToNumber,
  convertToAmountCents,
  convertToBasisPoints,
  validateAmountCents,
  validateBasisPoints,
  validateNumber,
} from '../src/validation.ts';
import {
  decimalToCents,
  percent100ToBasisPoints,
  percent1ToBasisPoints,
} from '../src/conversions.ts';
import {
  calculateTaxFromBase,
  calculateBaseFromTotal,
  calculateTaxBreakdown,
} from '../src/calculations.ts';

// Test invalid string inputs (non-numeric, empty, malformed numbers)
Deno.test("Error Handling - Invalid string inputs across all functions", () => {
  const invalidStrings = [
    "",           // empty string
    "   ",        // whitespace only
    "\t\n",       // tabs and newlines only
    "abc",        // non-numeric
    "123abc",     // starts numeric but contains letters
    "abc123",     // starts with letters
    "12.34.56",   // malformed decimal
    "12,345",     // comma separator
    "12.34.56.78", // multiple decimals
    "not-a-number", // clearly non-numeric
    "123.45.67.89", // excessive decimals
    "12..34",     // double decimal
    "12.34.",     // trailing decimal
    ".123.",      // leading and trailing decimal
    "12 34",      // space in middle
    "12.34 56",   // space after decimal
    "1e2e3",      // malformed scientific notation
    "++123",      // double plus
    "--123",      // double minus
    "+-123",      // mixed signs
    "123-",       // trailing minus
    "123+",       // trailing plus
    "12.34e",     // incomplete scientific notation
    "12.34e+",    // incomplete scientific notation with sign
    "NaN",        // string "NaN" - this will convert to NaN and fail validation
    "Infinity",   // string "Infinity" - this will convert to Infinity and fail validation
    "-Infinity",  // string "-Infinity" - this will convert to -Infinity and fail validation
    "undefined",  // string "undefined"
    "null",       // string "null"
    "true",       // string "true"
    "false",      // string "false"
    "{}",         // string representation of object
    "[]",         // string representation of array
    "function",   // string "function"
  ];

  // Test convertToNumber with all invalid strings
  invalidStrings.forEach(invalidString => {
    // Special cases that convert to valid numbers but fail validation
    if (invalidString === "Infinity" || invalidString === "-Infinity" || invalidString === "NaN") {
      // These convert successfully but should fail in validation functions
      try {
        const result = convertToNumber(invalidString, "TestField");
        // Should either throw or return the special value
        if (invalidString === "NaN") {
          assertEquals(Number.isNaN(result), true, `convertToNumber should handle NaN string`);
        } else {
          assertEquals(Number.isFinite(result), false, `convertToNumber should handle Infinity string`);
        }
      } catch (error) {
        // It's also valid to throw for these cases
        assertEquals(error instanceof Error, true, `Should throw Error for "${invalidString}"`);
      }
    } else {
      assertThrows(
        () => convertToNumber(invalidString, "TestField"),
        Error,
        undefined, // Don't check specific message, just that it throws
        `convertToNumber should throw for invalid string: "${invalidString}"`
      );
    }
  });

  // Test convertToAmountCents with all invalid strings
  invalidStrings.forEach(invalidString => {
    assertThrows(
      () => convertToAmountCents(invalidString),
      Error,
      undefined,
      `convertToAmountCents should throw for invalid string: "${invalidString}"`
    );
  });

  // Test convertToBasisPoints with all invalid strings
  invalidStrings.forEach(invalidString => {
    assertThrows(
      () => convertToBasisPoints(invalidString),
      Error,
      undefined,
      `convertToBasisPoints should throw for invalid string: "${invalidString}"`
    );
  });
});

Deno.test("Error Handling - Invalid strings in conversion functions", () => {
  const invalidStrings = ["", "abc", "12.34.56", "not-a-number"];

  invalidStrings.forEach(invalidString => {
    // Test decimalToCents
    assertThrows(
      () => decimalToCents(invalidString),
      Error,
      undefined,
      `decimalToCents should throw for: "${invalidString}"`
    );

    // Test percent100ToBasisPoints
    assertThrows(
      () => percent100ToBasisPoints(invalidString),
      Error,
      undefined,
      `percent100ToBasisPoints should throw for: "${invalidString}"`
    );

    // Test percent1ToBasisPoints
    assertThrows(
      () => percent1ToBasisPoints(invalidString),
      Error,
      undefined,
      `percent1ToBasisPoints should throw for: "${invalidString}"`
    );
  });
});

Deno.test("Error Handling - Invalid strings in calculation functions", () => {
  const invalidStrings = ["", "abc", "12.34.56", "not-a-number"];

  invalidStrings.forEach(invalidString => {
    // Test calculateTaxFromBase with invalid base amount
    assertThrows(
      () => calculateTaxFromBase(invalidString, "1300"),
      Error,
      undefined,
      `calculateTaxFromBase should throw for invalid base: "${invalidString}"`
    );

    // Test calculateTaxFromBase with invalid tax rate
    assertThrows(
      () => calculateTaxFromBase("100000", invalidString),
      Error,
      undefined,
      `calculateTaxFromBase should throw for invalid tax rate: "${invalidString}"`
    );

    // Test calculateBaseFromTotal with invalid total amount
    assertThrows(
      () => calculateBaseFromTotal(invalidString, "1300"),
      Error,
      undefined,
      `calculateBaseFromTotal should throw for invalid total: "${invalidString}"`
    );

    // Test calculateBaseFromTotal with invalid tax rate
    assertThrows(
      () => calculateBaseFromTotal("3200000", invalidString),
      Error,
      undefined,
      `calculateBaseFromTotal should throw for invalid tax rate: "${invalidString}"`
    );

    // Test calculateTaxBreakdown with invalid total amount
    assertThrows(
      () => calculateTaxBreakdown(invalidString, "1300"),
      Error,
      undefined,
      `calculateTaxBreakdown should throw for invalid total: "${invalidString}"`
    );

    // Test calculateTaxBreakdown with invalid tax rate
    assertThrows(
      () => calculateTaxBreakdown("3200000", invalidString),
      Error,
      undefined,
      `calculateTaxBreakdown should throw for invalid tax rate: "${invalidString}"`
    );
  });
});

// Test string inputs that fail existing validation rules
Deno.test("Error Handling - String inputs that fail validation rules", () => {
  // Test negative values as strings
  const negativeIntegerStrings = ["-1", "-100"];
  const negativeDecimalStrings = ["-123.45", "-0.01"];
  
  negativeIntegerStrings.forEach(negativeString => {
    // Test validateAmountCents - should fail on negative check
    assertThrows(
      () => validateAmountCents(negativeString),
      Error,
      "Amount cannot be negative",
      `validateAmountCents should reject negative integer string: "${negativeString}"`
    );

    // Test validateBasisPoints - should fail on negative check
    assertThrows(
      () => validateBasisPoints(negativeString),
      Error,
      "Basis points cannot be negative",
      `validateBasisPoints should reject negative integer string: "${negativeString}"`
    );

    // Test validateNumber - should fail on negative check
    assertThrows(
      () => validateNumber(negativeString, "TestField"),
      Error,
      "TestField cannot be negative",
      `validateNumber should reject negative integer string: "${negativeString}"`
    );
  });

  negativeDecimalStrings.forEach(negativeString => {
    // Test validateAmountCents - should fail on integer check first (validation order)
    assertThrows(
      () => validateAmountCents(negativeString),
      Error,
      "Amount in cents must be an integer",
      `validateAmountCents should reject negative decimal string: "${negativeString}"`
    );

    // Test validateBasisPoints - should fail on integer check first (validation order)
    assertThrows(
      () => validateBasisPoints(negativeString),
      Error,
      "Basis points must be an integer",
      `validateBasisPoints should reject negative decimal string: "${negativeString}"`
    );

    // Test validateNumber - should fail on negative check (no integer requirement)
    assertThrows(
      () => validateNumber(negativeString, "TestField"),
      Error,
      "TestField cannot be negative",
      `validateNumber should reject negative decimal string: "${negativeString}"`
    );
  });

  // Test non-integer values for amount cents
  const nonIntegerStrings = ["123.45", "0.1", "1.5", "99.99"];
  
  nonIntegerStrings.forEach(nonIntegerString => {
    assertThrows(
      () => validateAmountCents(nonIntegerString),
      Error,
      "Amount in cents must be an integer",
      `validateAmountCents should reject non-integer string: "${nonIntegerString}"`
    );

    assertThrows(
      () => validateBasisPoints(nonIntegerString),
      Error,
      "Basis points must be an integer",
      `validateBasisPoints should reject non-integer string: "${nonIntegerString}"`
    );
  });

  // Test excessive values as strings
  const excessiveValues = [
    (Number.MAX_SAFE_INTEGER + 1).toString(),
    "999999999999999999999",
    "1000001", // For basis points (exceeds 1000000 limit)
  ];

  // Test excessive amount values
  assertThrows(
    () => validateAmountCents(excessiveValues[0]),
    Error,
    "exceeds maximum safe value",
    `validateAmountCents should reject excessive value: "${excessiveValues[0]}"`
  );

  // Test excessive basis points
  assertThrows(
    () => validateBasisPoints(excessiveValues[2]),
    Error,
    "exceeds reasonable maximum of 1000000",
    `validateBasisPoints should reject excessive value: "${excessiveValues[2]}"`
  );
});

// Test that error messages include original string values
Deno.test("Error Handling - Error messages include original string values", () => {
  const testCases = [
    { input: "invalid-123", expectedInMessage: "invalid-123" },
    { input: "not-a-number", expectedInMessage: "not-a-number" },
    { input: "12.34.56", expectedInMessage: "12.34.56" },
    { input: "abc123def", expectedInMessage: "abc123def" },
    { input: "special@chars!", expectedInMessage: "special@chars!" },
    { input: "unicode-测试", expectedInMessage: "unicode-测试" },
    { input: "spaces in string", expectedInMessage: "spaces in string" },
    { input: "tabs\tand\nnewlines", expectedInMessage: "tabs\tand\nnewlines" },
  ];

  testCases.forEach(({ input, expectedInMessage }) => {
    // Test convertToNumber error messages
    try {
      convertToNumber(input, "TestField");
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(expectedInMessage),
        true,
        `convertToNumber error message should include "${expectedInMessage}": ${message}`
      );
      assertEquals(
        message.includes("TestField"),
        true,
        `convertToNumber error message should include field name: ${message}`
      );
    }

    // Test convertToAmountCents error messages
    try {
      convertToAmountCents(input);
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(expectedInMessage),
        true,
        `convertToAmountCents error message should include "${expectedInMessage}": ${message}`
      );
      assertEquals(
        message.includes("Amount"),
        true,
        `convertToAmountCents error message should include "Amount": ${message}`
      );
    }

    // Test convertToBasisPoints error messages
    try {
      convertToBasisPoints(input);
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(expectedInMessage),
        true,
        `convertToBasisPoints error message should include "${expectedInMessage}": ${message}`
      );
      assertEquals(
        message.includes("Basis points"),
        true,
        `convertToBasisPoints error message should include "Basis points": ${message}`
      );
    }
  });
});

Deno.test("Error Handling - Error messages in calculation functions include original values", () => {
  const invalidInputs = ["invalid-amount", "not-a-tax-rate", "malformed.12.34"];

  invalidInputs.forEach(invalidInput => {
    // Test calculateTaxFromBase error messages
    try {
      calculateTaxFromBase(invalidInput, "1300");
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(invalidInput),
        true,
        `calculateTaxFromBase error should include original input "${invalidInput}": ${message}`
      );
    }

    try {
      calculateTaxFromBase("100000", invalidInput);
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(invalidInput),
        true,
        `calculateTaxFromBase error should include original tax rate "${invalidInput}": ${message}`
      );
    }

    // Test calculateBaseFromTotal error messages
    try {
      calculateBaseFromTotal(invalidInput, "1300");
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(invalidInput),
        true,
        `calculateBaseFromTotal error should include original input "${invalidInput}": ${message}`
      );
    }

    // Test calculateTaxBreakdown error messages
    try {
      calculateTaxBreakdown(invalidInput, "1300");
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      assertEquals(
        message.includes(invalidInput),
        true,
        `calculateTaxBreakdown error should include original input "${invalidInput}": ${message}`
      );
    }
  });
});

// Test mixed valid/invalid string and number inputs
Deno.test("Error Handling - Mixed valid/invalid string and number inputs", () => {
  const validNumbers = [100000, 1300, 0, 12345];
  const validStrings = ["100000", "1300", "0", "12345"];
  const invalidStrings = ["", "abc", "12.34.56", "not-a-number"];
  const invalidNumbers = [NaN, Infinity, -1, 123.45]; // Invalid for amount cents/basis points

  // Test calculateTaxFromBase with mixed inputs
  validNumbers.forEach(validNumber => {
    invalidStrings.forEach(invalidString => {
      // Valid number, invalid string
      assertThrows(
        () => calculateTaxFromBase(validNumber, invalidString),
        Error,
        undefined,
        `calculateTaxFromBase should fail with valid number ${validNumber} and invalid string "${invalidString}"`
      );

      // Invalid string, valid number
      assertThrows(
        () => calculateTaxFromBase(invalidString, validNumber),
        Error,
        undefined,
        `calculateTaxFromBase should fail with invalid string "${invalidString}" and valid number ${validNumber}`
      );
    });
  });

  // Test calculateBaseFromTotal with mixed inputs
  validStrings.forEach(validString => {
    invalidNumbers.forEach(invalidNumber => {
      // Valid string, invalid number
      assertThrows(
        () => calculateBaseFromTotal(validString, invalidNumber),
        Error,
        undefined,
        `calculateBaseFromTotal should fail with valid string "${validString}" and invalid number ${invalidNumber}`
      );

      // Invalid number, valid string
      assertThrows(
        () => calculateBaseFromTotal(invalidNumber, validString),
        Error,
        undefined,
        `calculateBaseFromTotal should fail with invalid number ${invalidNumber} and valid string "${validString}"`
      );
    });
  });

  // Test calculateTaxBreakdown with mixed inputs
  validNumbers.forEach(validNumber => {
    invalidStrings.forEach(invalidString => {
      // Valid number, invalid string
      assertThrows(
        () => calculateTaxBreakdown(validNumber, invalidString),
        Error,
        undefined,
        `calculateTaxBreakdown should fail with valid number ${validNumber} and invalid string "${invalidString}"`
      );

      // Invalid string, valid number
      assertThrows(
        () => calculateTaxBreakdown(invalidString, validNumber),
        Error,
        undefined,
        `calculateTaxBreakdown should fail with invalid string "${invalidString}" and valid number ${validNumber}`
      );
    });
  });
});

// Test that all existing error handling continues to work for number inputs
Deno.test("Error Handling - Existing number input error handling unchanged", () => {
  // Test that number input validation still works exactly as before
  
  // Test NaN inputs
  assertThrows(() => validateAmountCents(NaN), Error, "Amount cannot be NaN");
  assertThrows(() => validateBasisPoints(NaN), Error, "Basis points cannot be NaN");
  assertThrows(() => validateNumber(NaN, "Test"), Error, "Test cannot be NaN");

  // Test Infinity inputs
  assertThrows(() => validateAmountCents(Infinity), Error, "Amount must be finite");
  assertThrows(() => validateBasisPoints(Infinity), Error, "Basis points must be finite");
  assertThrows(() => validateNumber(Infinity, "Test"), Error, "Test must be finite");

  // Test negative inputs
  assertThrows(() => validateAmountCents(-1), Error, "Amount cannot be negative");
  assertThrows(() => validateBasisPoints(-1), Error, "Basis points cannot be negative");
  assertThrows(() => validateNumber(-1, "Test"), Error, "Test cannot be negative");

  // Test non-integer inputs for amount cents
  assertThrows(() => validateAmountCents(123.45), Error, "Amount in cents must be an integer");
  assertThrows(() => validateBasisPoints(123.45), Error, "Basis points must be an integer");

  // Test excessive values
  const largeValue = Number.MAX_SAFE_INTEGER;
  assertThrows(() => validateAmountCents(largeValue), Error, "exceeds maximum safe value");
  assertThrows(() => validateBasisPoints(1000001), Error, "exceeds reasonable maximum of 1000000");

  // Test calculation functions with number inputs
  assertThrows(() => calculateTaxFromBase(NaN, 1300), Error, "Amount cannot be NaN");
  assertThrows(() => calculateTaxFromBase(100000, NaN), Error, "Basis points cannot be NaN");
  assertThrows(() => calculateBaseFromTotal(NaN, 1300), Error, "Amount cannot be NaN");
  assertThrows(() => calculateTaxBreakdown(NaN, 1300), Error, "Amount cannot be NaN");

  // Test conversion functions with number inputs
  assertThrows(() => decimalToCents(NaN), Error, "cannot be NaN");
  assertThrows(() => decimalToCents(-1), Error, "cannot be negative");
  assertThrows(() => percent100ToBasisPoints(NaN), Error, "cannot be NaN");
  assertThrows(() => percent1ToBasisPoints(NaN), Error, "cannot be NaN");
});

// Test non-string/non-number type inputs
Deno.test("Error Handling - Non-string/non-number type inputs", () => {
  const invalidTypes = [
    null,
    undefined,
    true,
    false,
    {},
    [],
    function() {},
    Symbol('test'),
    new Date(),
    /regex/,
  ];

  invalidTypes.forEach(invalidType => {
    // Test convertToNumber
    assertThrows(
      () => convertToNumber(invalidType as any, "TestField"),
      Error,
      "must be a string or number",
      `convertToNumber should reject type ${typeof invalidType}`
    );

    // Test validateAmountCents
    assertThrows(
      () => validateAmountCents(invalidType as any),
      Error,
      "must be a string or number",
      `validateAmountCents should reject type ${typeof invalidType}`
    );

    // Test validateBasisPoints
    assertThrows(
      () => validateBasisPoints(invalidType as any),
      Error,
      "must be a string or number",
      `validateBasisPoints should reject type ${typeof invalidType}`
    );

    // Test validateNumber
    assertThrows(
      () => validateNumber(invalidType as any, "TestField"),
      Error,
      "must be a string or number",
      `validateNumber should reject type ${typeof invalidType}`
    );

    // Test conversion functions
    assertThrows(
      () => decimalToCents(invalidType as any),
      Error,
      "must be a string or number",
      `decimalToCents should reject type ${typeof invalidType}`
    );

    assertThrows(
      () => percent100ToBasisPoints(invalidType as any),
      Error,
      "must be a string or number",
      `percent100ToBasisPoints should reject type ${typeof invalidType}`
    );

    assertThrows(
      () => percent1ToBasisPoints(invalidType as any),
      Error,
      "must be a string or number",
      `percent1ToBasisPoints should reject type ${typeof invalidType}`
    );

    // Test calculation functions
    assertThrows(
      () => calculateTaxFromBase(invalidType as any, "1300"),
      Error,
      "must be a string or number",
      `calculateTaxFromBase should reject type ${typeof invalidType} for base amount`
    );

    assertThrows(
      () => calculateTaxFromBase("100000", invalidType as any),
      Error,
      "must be a string or number",
      `calculateTaxFromBase should reject type ${typeof invalidType} for tax rate`
    );

    assertThrows(
      () => calculateBaseFromTotal(invalidType as any, "1300"),
      Error,
      "must be a string or number",
      `calculateBaseFromTotal should reject type ${typeof invalidType} for total amount`
    );

    assertThrows(
      () => calculateTaxBreakdown(invalidType as any, "1300"),
      Error,
      "must be a string or number",
      `calculateTaxBreakdown should reject type ${typeof invalidType} for total amount`
    );
  });
});

// Test edge cases for string conversion
Deno.test("Error Handling - String conversion edge cases", () => {
  // Test strings that might be confusing for Number() constructor
  const edgeCaseStrings = [
    "0x123",      // Hexadecimal
    "0o123",      // Octal
    "0b101",      // Binary
    "1e",         // Incomplete scientific notation
    "1e+",        // Incomplete scientific notation with sign
    "1e-",        // Incomplete scientific notation with negative sign
    "1.2.3e4",    // Multiple decimals with scientific notation
    "++1",        // Double plus sign
    "--1",        // Double minus sign
    "+-1",        // Plus and minus
    "-+1",        // Minus and plus
    "1-",         // Trailing minus
    "1+",         // Trailing plus
    " 1 2 ",      // Spaces in middle
    "1\t2",       // Tab in middle
    "1\n2",       // Newline in middle
    "1\r2",       // Carriage return in middle
    "1 ",         // Trailing space (should work after trim)
    " 1",         // Leading space (should work after trim)
  ];

  edgeCaseStrings.forEach(edgeCase => {
    // Most of these should fail, but some might pass (like "0x123" which Number() accepts)
    // We're testing that the function handles them consistently
    try {
      const result = convertToNumber(edgeCase, "TestField");
      // If it doesn't throw, it should return a valid number
      assertEquals(typeof result, 'number', `convertToNumber should return number for "${edgeCase}"`);
      assertEquals(Number.isNaN(result), false, `convertToNumber should not return NaN for "${edgeCase}"`);
      assertEquals(Number.isFinite(result), true, `convertToNumber should return finite number for "${edgeCase}"`);
    } catch (error) {
      // If it throws, the error message should include the original input
      const message = (error as Error).message;
      assertEquals(
        message.includes(edgeCase) || message.includes("TestField"),
        true,
        `Error message should include original input or field name for "${edgeCase}": ${message}`
      );
    }
  });
});

// Test parameter identification in error messages
Deno.test("Error Handling - Parameter identification in error messages", () => {
  const invalidInput = "invalid-input";

  // Test that error messages identify which parameter caused the error
  try {
    calculateTaxFromBase(invalidInput, "1300");
    throw new Error("Should have thrown");
  } catch (error) {
    const message = (error as Error).message;
    assertEquals(
      message.includes("Amount") || message.includes("base"),
      true,
      `Error should identify base amount parameter: ${message}`
    );
  }

  try {
    calculateTaxFromBase("100000", invalidInput);
    throw new Error("Should have thrown");
  } catch (error) {
    const message = (error as Error).message;
    assertEquals(
      message.includes("Basis points") || message.includes("tax"),
      true,
      `Error should identify tax rate parameter: ${message}`
    );
  }

  try {
    calculateBaseFromTotal(invalidInput, "1300");
    throw new Error("Should have thrown");
  } catch (error) {
    const message = (error as Error).message;
    assertEquals(
      message.includes("Amount") || message.includes("total"),
      true,
      `Error should identify total amount parameter: ${message}`
    );
  }

  try {
    decimalToCents(invalidInput);
    throw new Error("Should have thrown");
  } catch (error) {
    const message = (error as Error).message;
    assertEquals(
      message.includes("Decimal amount") || message.includes("Amount"),
      true,
      `Error should identify decimal amount parameter: ${message}`
    );
  }

  try {
    percent100ToBasisPoints(invalidInput);
    throw new Error("Should have thrown");
  } catch (error) {
    const message = (error as Error).message;
    assertEquals(
      message.includes("Percentage") || message.includes("percent"),
      true,
      `Error should identify percentage parameter: ${message}`
    );
  }
});