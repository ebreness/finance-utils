/**
 * Unit tests for validation functions
 */

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { validateAmountCents, validateBasisPoints, checkSafeOperation, validateNumber, validateIntegerForFormatting, validateNumberForFormatting, convertToNumber, convertToAmountCents, convertToBasisPoints } from '../src/validation.ts';
import { MAX_SAFE_CENTS } from '../src/constants.ts';

Deno.test("validateAmountCents - valid inputs", () => {
  assertEquals(validateAmountCents(0), 0);
  assertEquals(validateAmountCents(100), 100);
  assertEquals(validateAmountCents(12345), 12345);
  assertEquals(validateAmountCents(MAX_SAFE_CENTS), MAX_SAFE_CENTS);
});

Deno.test("validateAmountCents - valid string inputs", () => {
  assertEquals(validateAmountCents("0"), 0);
  assertEquals(validateAmountCents("100"), 100);
  assertEquals(validateAmountCents("12345"), 12345);
});

Deno.test("validateAmountCents - invalid string inputs", () => {
  assertThrows(
    () => validateAmountCents("abc"),
    Error,
    'Amount "abc" is not a valid number'
  );
  
  assertThrows(
    () => validateAmountCents(""),
    Error,
    "Amount cannot be empty string"
  );
  
  assertThrows(
    () => validateAmountCents("123.45"),
    Error,
    "Amount in cents must be an integer"
  );
});

Deno.test("validateAmountCents - non-string/number types", () => {
  assertThrows(
    () => validateAmountCents(null as unknown as string),
    Error,
    "Amount must be a string or number, received object"
  );
  
  assertThrows(
    () => validateAmountCents(undefined as unknown as string),
    Error,
    "Amount must be a string or number, received undefined"
  );
  
  assertThrows(
    () => validateAmountCents(true as unknown as string),
    Error,
    "Amount must be a string or number, received boolean"
  );
  
  assertThrows(
    () => validateAmountCents({} as unknown as string),
    Error,
    "Amount must be a string or number, received object"
  );
});

Deno.test("validateAmountCents - NaN and infinity", () => {
  assertThrows(
    () => validateAmountCents(NaN),
    Error,
    "Amount cannot be NaN"
  );
  
  assertThrows(
    () => validateAmountCents(Infinity),
    Error,
    "Amount must be finite"
  );
  
  assertThrows(
    () => validateAmountCents(-Infinity),
    Error,
    "Amount must be finite"
  );
});

Deno.test("validateAmountCents - non-integer values", () => {
  assertThrows(
    () => validateAmountCents(123.45),
    Error,
    "Amount in cents must be an integer"
  );
  
  assertThrows(
    () => validateAmountCents(0.1),
    Error,
    "Amount in cents must be an integer"
  );
});

Deno.test("validateAmountCents - negative values", () => {
  assertThrows(
    () => validateAmountCents(-1),
    Error,
    "Amount cannot be negative"
  );
  
  assertThrows(
    () => validateAmountCents(-100),
    Error,
    "Amount cannot be negative"
  );
});

Deno.test("validateAmountCents - overflow", () => {
  assertThrows(
    () => validateAmountCents(MAX_SAFE_CENTS + 1),
    Error,
    `Amount ${MAX_SAFE_CENTS + 1} exceeds maximum safe value ${MAX_SAFE_CENTS}`
  );
});

Deno.test("validateBasisPoints - valid inputs", () => {
  assertEquals(validateBasisPoints(0), 0);
  assertEquals(validateBasisPoints(100), 100);
  assertEquals(validateBasisPoints(1300), 1300); // 13%
  assertEquals(validateBasisPoints(10000), 10000); // 100%
});

Deno.test("validateBasisPoints - valid string inputs", () => {
  assertEquals(validateBasisPoints("0"), 0);
  assertEquals(validateBasisPoints("100"), 100);
  assertEquals(validateBasisPoints("1300"), 1300);
  assertEquals(validateBasisPoints("10000"), 10000);
});

Deno.test("validateBasisPoints - invalid string inputs", () => {
  assertThrows(
    () => validateBasisPoints("abc"),
    Error,
    'Basis points "abc" is not a valid number'
  );
  
  assertThrows(
    () => validateBasisPoints(""),
    Error,
    "Basis points cannot be empty string"
  );
  
  assertThrows(
    () => validateBasisPoints("13.5"),
    Error,
    "Basis points must be an integer"
  );
});

Deno.test("validateBasisPoints - non-string/number types", () => {
  assertThrows(
    () => validateBasisPoints(null as unknown as string),
    Error,
    "Basis points must be a string or number, received object"
  );
  
  assertThrows(
    () => validateBasisPoints(undefined as unknown as string),
    Error,
    "Basis points must be a string or number, received undefined"
  );
  
  assertThrows(
    () => validateBasisPoints(false as unknown as string),
    Error,
    "Basis points must be a string or number, received boolean"
  );
});

Deno.test("validateBasisPoints - NaN and infinity", () => {
  assertThrows(
    () => validateBasisPoints(NaN),
    Error,
    "Basis points cannot be NaN"
  );
  
  assertThrows(
    () => validateBasisPoints(Infinity),
    Error,
    "Basis points must be finite"
  );
});

Deno.test("validateBasisPoints - non-integer values", () => {
  assertThrows(
    () => validateBasisPoints(13.5),
    Error,
    "Basis points must be an integer"
  );
});

Deno.test("validateBasisPoints - negative values", () => {
  assertThrows(
    () => validateBasisPoints(-1),
    Error,
    "Basis points cannot be negative"
  );
});

Deno.test("validateBasisPoints - unreasonable values", () => {
  assertThrows(
    () => validateBasisPoints(1000001),
    Error,
    "Basis points 1000001 exceeds reasonable maximum of 1000000 (10000%)"
  );
});

Deno.test("checkSafeOperation - valid operations", () => {
  // These should not throw
  checkSafeOperation(100, 200, "addition");
  checkSafeOperation(1000, 500, "subtraction");
  checkSafeOperation(100, 50, "multiplication");
});

Deno.test("checkSafeOperation - unsafe individual values", () => {
  const unsafeValue = Number.MAX_SAFE_INTEGER + 1;
  
  assertThrows(
    () => checkSafeOperation(unsafeValue, 100, "addition"),
    Error,
    `First operand ${unsafeValue} is not a safe integer for addition`
  );
  
  assertThrows(
    () => checkSafeOperation(100, unsafeValue, "multiplication"),
    Error,
    `Second operand ${unsafeValue} is not a safe integer for multiplication`
  );
});

Deno.test("checkSafeOperation - addition overflow", () => {
  const largeValue = Math.floor(Number.MAX_SAFE_INTEGER / 2) + 1;
  
  assertThrows(
    () => checkSafeOperation(largeValue, largeValue, "addition"),
    Error,
    `Addition overflow: ${largeValue} + ${largeValue} would exceed MAX_SAFE_INTEGER`
  );
});

Deno.test("checkSafeOperation - multiplication overflow", () => {
  const largeValue = Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)) + 1;
  
  assertThrows(
    () => checkSafeOperation(largeValue, largeValue, "multiplication"),
    Error,
    `Multiplication overflow: ${largeValue} * ${largeValue} would exceed MAX_SAFE_INTEGER`
  );
});

Deno.test("checkSafeOperation - edge cases", () => {
  // Zero operations should be safe
  checkSafeOperation(0, Number.MAX_SAFE_INTEGER, "multiplication");
  checkSafeOperation(Number.MAX_SAFE_INTEGER, 0, "multiplication");
  
  // Small values should be safe
  checkSafeOperation(1, 1, "addition");
  checkSafeOperation(1, 1, "multiplication");
});

// Tests for validateNumber function
Deno.test("validateNumber - valid inputs", () => {
  assertEquals(validateNumber(0, "Test"), 0);
  assertEquals(validateNumber(1.5, "Test"), 1.5);
  assertEquals(validateNumber(123.45, "Test"), 123.45);
  assertEquals(validateNumber(0.01, "Test"), 0.01);
});

Deno.test("validateNumber - valid string inputs", () => {
  assertEquals(validateNumber("0", "Test"), 0);
  assertEquals(validateNumber("1.5", "Test"), 1.5);
  assertEquals(validateNumber("123.45", "Test"), 123.45);
  assertEquals(validateNumber("0.01", "Test"), 0.01);
});

Deno.test("validateNumber - invalid string inputs", () => {
  assertThrows(() => validateNumber("abc", "Test"), Error, 'Test "abc" is not a valid number');
  assertThrows(() => validateNumber("", "Test"), Error, "Test cannot be empty string");
  assertThrows(() => validateNumber("-1", "Test"), Error, "Test cannot be negative");
});

Deno.test("validateNumber - non-string/number types", () => {
  assertThrows(() => validateNumber(null as unknown as string, "Test"), Error, "Test must be a string or number, received object");
  assertThrows(() => validateNumber(undefined as unknown as string, "Test"), Error, "Test must be a string or number, received undefined");
  assertThrows(() => validateNumber(true as unknown as string, "Test"), Error, "Test must be a string or number, received boolean");
  assertThrows(() => validateNumber({} as unknown as string, "Test"), Error, "Test must be a string or number, received object");
  assertThrows(() => validateNumber([] as unknown as string, "Test"), Error, "Test must be a string or number, received object");
});

Deno.test("validateNumber - NaN and infinity", () => {
  assertThrows(() => validateNumber(NaN, "Test"), Error, "Test cannot be NaN");
  assertThrows(() => validateNumber(Infinity, "Test"), Error, "Test must be finite");
  assertThrows(() => validateNumber(-Infinity, "Test"), Error, "Test must be finite");
});

Deno.test("validateNumber - negative values", () => {
  assertThrows(() => validateNumber(-1, "Test"), Error, "Test cannot be negative");
  assertThrows(() => validateNumber(-0.01, "Test"), Error, "Test cannot be negative");
});

// Tests for validateIntegerForFormatting function
Deno.test("validateIntegerForFormatting - valid inputs", () => {
  assertEquals(validateIntegerForFormatting(123, "Test"), 123);
  assertEquals(validateIntegerForFormatting(0, "Test"), 0);
  assertEquals(validateIntegerForFormatting(-123, "Test"), -123);
  assertEquals(validateIntegerForFormatting(1000000, "Test"), 1000000);
});

Deno.test("validateIntegerForFormatting - null and undefined", () => {
  assertThrows(() => validateIntegerForFormatting(null, "Test"), Error, "Test cannot be null or undefined");
  assertThrows(() => validateIntegerForFormatting(undefined, "Test"), Error, "Test cannot be null or undefined");
});

Deno.test("validateIntegerForFormatting - non-number types", () => {
  assertThrows(() => validateIntegerForFormatting("123", "Test"), Error, "Test must be a number");
  assertThrows(() => validateIntegerForFormatting(true, "Test"), Error, "Test must be a number");
  assertThrows(() => validateIntegerForFormatting({}, "Test"), Error, "Test must be a number");
});

Deno.test("validateIntegerForFormatting - NaN and infinity", () => {
  assertThrows(() => validateIntegerForFormatting(NaN, "Test"), Error, "Test cannot be NaN");
  assertThrows(() => validateIntegerForFormatting(Infinity, "Test"), Error, "Test must be finite");
  assertThrows(() => validateIntegerForFormatting(-Infinity, "Test"), Error, "Test must be finite");
});

Deno.test("validateIntegerForFormatting - non-integer values", () => {
  assertThrows(() => validateIntegerForFormatting(123.45, "Test"), Error, "Test must be an integer");
  assertThrows(() => validateIntegerForFormatting(0.1, "Test"), Error, "Test must be an integer");
});

// Tests for validateNumberForFormatting function
Deno.test("validateNumberForFormatting - valid inputs", () => {
  assertEquals(validateNumberForFormatting(123.45, "Test"), 123.45);
  assertEquals(validateNumberForFormatting(0, "Test"), 0);
  assertEquals(validateNumberForFormatting(-123.45, "Test"), -123.45);
  assertEquals(validateNumberForFormatting(0.001, "Test"), 0.001);
});

Deno.test("validateNumberForFormatting - null and undefined", () => {
  assertThrows(() => validateNumberForFormatting(null, "Test"), Error, "Test cannot be null or undefined");
  assertThrows(() => validateNumberForFormatting(undefined, "Test"), Error, "Test cannot be null or undefined");
});

Deno.test("validateNumberForFormatting - non-number types", () => {
  assertThrows(() => validateNumberForFormatting("123", "Test"), Error, "Test must be a number");
  assertThrows(() => validateNumberForFormatting(true, "Test"), Error, "Test must be a number");
  assertThrows(() => validateNumberForFormatting({}, "Test"), Error, "Test must be a number");
});

Deno.test("validateNumberForFormatting - NaN and infinity", () => {
  assertThrows(() => validateNumberForFormatting(NaN, "Test"), Error, "Test cannot be NaN");
  assertThrows(() => validateNumberForFormatting(Infinity, "Test"), Error, "Test must be finite");
  assertThrows(() => validateNumberForFormatting(-Infinity, "Test"), Error, "Test must be finite");
});

// Tests for convertToNumber function
Deno.test("convertToNumber - valid number inputs", () => {
  assertEquals(convertToNumber(123, "Test"), 123);
  assertEquals(convertToNumber(0, "Test"), 0);
  assertEquals(convertToNumber(123.45, "Test"), 123.45);
  assertEquals(convertToNumber(0.01, "Test"), 0.01);
});

Deno.test("convertToNumber - valid string inputs", () => {
  assertEquals(convertToNumber("123", "Test"), 123);
  assertEquals(convertToNumber("0", "Test"), 0);
  assertEquals(convertToNumber("123.45", "Test"), 123.45);
  assertEquals(convertToNumber("0.01", "Test"), 0.01);
  assertEquals(convertToNumber("1300", "Test"), 1300);
});

Deno.test("convertToNumber - string inputs with whitespace should be accepted", () => {
  // Trimming is now supported - strings with leading/trailing whitespace are valid
  assertEquals(convertToNumber("  123  ", "Test"), 123);
  assertEquals(convertToNumber("\t123.45\n", "Test"), 123.45);
  assertEquals(convertToNumber(" 0 ", "Test"), 0);
  assertEquals(convertToNumber("   1300   ", "Test"), 1300);
  assertEquals(convertToNumber(" 123.45 ", "Test"), 123.45);
  assertEquals(convertToNumber("\n\t 42 \t\n", "Test"), 42);
});

Deno.test("convertToNumber - empty and whitespace-only strings", () => {
  assertThrows(
    () => convertToNumber("", "Test"),
    Error,
    "Test cannot be empty string"
  );
  
  // Whitespace-only strings should be treated as empty after trimming
  assertThrows(
    () => convertToNumber("   ", "Test"),
    Error,
    "Test cannot be empty string"
  );
  
  assertThrows(
    () => convertToNumber("\t\n", "Test"),
    Error,
    "Test cannot be empty string"
  );
});

Deno.test("convertToNumber - invalid string inputs", () => {
  assertThrows(
    () => convertToNumber("abc", "Test"),
    Error,
    'Test "abc" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("123abc", "Test"),
    Error,
    'Test "123abc" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("12.34.56", "Test"),
    Error,
    'Test "12.34.56" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("not-a-number", "Test"),
    Error,
    'Test "not-a-number" is not a valid number'
  );
});

Deno.test("convertToNumber - special string cases", () => {
  // Scientific notation should work
  assertEquals(convertToNumber("1e2", "Test"), 100);
  assertEquals(convertToNumber("1.23e2", "Test"), 123);
  
  // Negative numbers should work
  assertEquals(convertToNumber("-123", "Test"), -123);
  assertEquals(convertToNumber("-123.45", "Test"), -123.45);
  
  // Leading zeros should work
  assertEquals(convertToNumber("0123", "Test"), 123);
  assertEquals(convertToNumber("00.45", "Test"), 0.45);
});

Deno.test("convertToNumber - non-string/number types", () => {
  assertThrows(
    () => convertToNumber(null as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received object"
  );
  
  assertThrows(
    () => convertToNumber(undefined as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received undefined"
  );
  
  assertThrows(
    () => convertToNumber(true as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received boolean"
  );
  
  assertThrows(
    () => convertToNumber({} as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received object"
  );
  
  assertThrows(
    () => convertToNumber([] as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received object"
  );
});

// Tests for convertToAmountCents function
Deno.test("convertToAmountCents - valid number inputs", () => {
  assertEquals(convertToAmountCents(0), 0);
  assertEquals(convertToAmountCents(100), 100);
  assertEquals(convertToAmountCents(12345), 12345);
});

Deno.test("convertToAmountCents - valid string inputs", () => {
  assertEquals(convertToAmountCents("0"), 0);
  assertEquals(convertToAmountCents("100"), 100);
  assertEquals(convertToAmountCents("12345"), 12345);
});

Deno.test("convertToAmountCents - invalid string conversion", () => {
  assertThrows(
    () => convertToAmountCents("abc"),
    Error,
    'Amount "abc" is not a valid number'
  );
  
  assertThrows(
    () => convertToAmountCents(""),
    Error,
    "Amount cannot be empty string"
  );
  
  assertThrows(
    () => convertToAmountCents("123.45"),
    Error,
    "Amount in cents must be an integer"
  );
});

Deno.test("convertToAmountCents - validation failures after conversion", () => {
  assertThrows(
    () => convertToAmountCents("-100"),
    Error,
    "Amount cannot be negative"
  );
  
  assertThrows(
    () => convertToAmountCents("123.45"),
    Error,
    "Amount in cents must be an integer"
  );
  
  const overflowValue = (MAX_SAFE_CENTS + 1).toString();
  assertThrows(
    () => convertToAmountCents(overflowValue),
    Error,
    `Amount ${MAX_SAFE_CENTS + 1} exceeds maximum safe value ${MAX_SAFE_CENTS}`
  );
});

Deno.test("convertToAmountCents - edge cases", () => {
  // Large valid values
  assertEquals(convertToAmountCents(MAX_SAFE_CENTS.toString()), MAX_SAFE_CENTS);
});

// Tests for convertToBasisPoints function
Deno.test("convertToBasisPoints - valid number inputs", () => {
  assertEquals(convertToBasisPoints(0), 0);
  assertEquals(convertToBasisPoints(100), 100);
  assertEquals(convertToBasisPoints(1300), 1300);
  assertEquals(convertToBasisPoints(10000), 10000);
});

Deno.test("convertToBasisPoints - valid string inputs", () => {
  assertEquals(convertToBasisPoints("0"), 0);
  assertEquals(convertToBasisPoints("100"), 100);
  assertEquals(convertToBasisPoints("1300"), 1300);
  assertEquals(convertToBasisPoints("10000"), 10000);
});

Deno.test("convertToBasisPoints - invalid string conversion", () => {
  assertThrows(
    () => convertToBasisPoints("abc"),
    Error,
    'Basis points "abc" is not a valid number'
  );
  
  assertThrows(
    () => convertToBasisPoints(""),
    Error,
    "Basis points cannot be empty string"
  );
  
  assertThrows(
    () => convertToBasisPoints("13.5"),
    Error,
    "Basis points must be an integer"
  );
});

Deno.test("convertToBasisPoints - validation failures after conversion", () => {
  assertThrows(
    () => convertToBasisPoints("-100"),
    Error,
    "Basis points cannot be negative"
  );
  
  assertThrows(
    () => convertToBasisPoints("13.5"),
    Error,
    "Basis points must be an integer"
  );
  
  assertThrows(
    () => convertToBasisPoints("1000001"),
    Error,
    "Basis points 1000001 exceeds reasonable maximum of 1000000 (10000%)"
  );
});

Deno.test("convertToBasisPoints - edge cases", () => {
  // Maximum valid value
  assertEquals(convertToBasisPoints("1000000"), 1000000);
  
  // Scientific notation
  assertEquals(convertToBasisPoints("1e3"), 1000);
});

// Tests for error message consistency
Deno.test("convertToNumber - error messages include original input", () => {
  const originalInput = "invalid-123";
  try {
    convertToNumber(originalInput, "TestField");
  } catch (error) {
    assertEquals((error as Error).message.includes(originalInput), true);
    assertEquals((error as Error).message.includes("TestField"), true);
  }
});

Deno.test("convertToAmountCents - error messages include original input", () => {
  const originalInput = "not-a-number";
  try {
    convertToAmountCents(originalInput);
  } catch (error) {
    assertEquals((error as Error).message.includes(originalInput), true);
    assertEquals((error as Error).message.includes("Amount"), true);
  }
});

Deno.test("convertToBasisPoints - error messages include original input", () => {
  const originalInput = "invalid-bp";
  try {
    convertToBasisPoints(originalInput);
  } catch (error) {
    assertEquals((error as Error).message.includes(originalInput), true);
    assertEquals((error as Error).message.includes("Basis points"), true);
  }
});

// Additional tests for string input validation with whitespace trimming (Requirements 1.1-1.6)
Deno.test("convertToNumber - whitespace trimming behavior", () => {
  // Valid strings without whitespace should work
  assertEquals(convertToNumber("123", "Test"), 123);
  assertEquals(convertToNumber("0", "Test"), 0);
  assertEquals(convertToNumber("123.45", "Test"), 123.45);
  
  // Strings with whitespace should now be accepted and trimmed
  assertEquals(convertToNumber(" 123", "Test"), 123);
  assertEquals(convertToNumber("123 ", "Test"), 123);
  assertEquals(convertToNumber(" 123 ", "Test"), 123);
  assertEquals(convertToNumber("\t123.45\n", "Test"), 123.45);
});

Deno.test("validateAmountCents - string input validation edge cases", () => {
  // Valid string inputs
  assertEquals(validateAmountCents("0"), 0);
  assertEquals(validateAmountCents("1"), 1);
  assertEquals(validateAmountCents("12345"), 12345);
  
  // Valid string inputs with whitespace (now supported with trimming)
  assertEquals(validateAmountCents(" 100"), 100);
  assertEquals(validateAmountCents("100 "), 100);
  assertEquals(validateAmountCents("\t100"), 100);
  assertEquals(validateAmountCents(" 100 "), 100);
  assertEquals(validateAmountCents("\n\t 42 \t\n"), 42);
  
  // Invalid string inputs that cannot be converted
  assertThrows(
    () => validateAmountCents("100abc"),
    Error,
    'Amount "100abc" is not a valid number'
  );
  
  assertThrows(
    () => validateAmountCents("abc100"),
    Error,
    'Amount "abc100" is not a valid number'
  );
  
  // String inputs that convert to invalid amounts
  assertThrows(
    () => validateAmountCents("-100"),
    Error,
    "Amount cannot be negative"
  );
  
  assertThrows(
    () => validateAmountCents("100.5"),
    Error,
    "Amount in cents must be an integer"
  );
});

Deno.test("validateBasisPoints - string input validation edge cases", () => {
  // Valid string inputs
  assertEquals(validateBasisPoints("0"), 0);
  assertEquals(validateBasisPoints("1300"), 1300);
  assertEquals(validateBasisPoints("10000"), 10000);
  
  // Valid string inputs with whitespace (now supported with trimming)
  assertEquals(validateBasisPoints(" 1300"), 1300);
  assertEquals(validateBasisPoints("1300 "), 1300);
  assertEquals(validateBasisPoints("\n1300"), 1300);
  assertEquals(validateBasisPoints(" 1300 "), 1300);
  assertEquals(validateBasisPoints("\t\n 500 \t\n"), 500);
  
  // Invalid string inputs that cannot be converted
  assertThrows(
    () => validateBasisPoints("1300bp"),
    Error,
    'Basis points "1300bp" is not a valid number'
  );
  
  assertThrows(
    () => validateBasisPoints("bp1300"),
    Error,
    'Basis points "bp1300" is not a valid number'
  );
  
  // String inputs that convert to invalid basis points
  assertThrows(
    () => validateBasisPoints("-1300"),
    Error,
    "Basis points cannot be negative"
  );
  
  assertThrows(
    () => validateBasisPoints("1300.5"),
    Error,
    "Basis points must be an integer"
  );
});

Deno.test("convertToNumber - null and undefined handling", () => {
  // Null and undefined should throw specific errors
  assertThrows(
    () => convertToNumber(null as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received object"
  );
  
  assertThrows(
    () => convertToNumber(undefined as unknown as string, "Test"),
    Error,
    "Test must be a string or number, received undefined"
  );
});

Deno.test("convertToNumber - infinity handling after string conversion", () => {
  // String that converts to infinity should be caught
  assertThrows(
    () => convertToNumber("Infinity", "Test"),
    Error,
    'Test "Infinity" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("-Infinity", "Test"),
    Error,
    'Test "-Infinity" is not a valid number'
  );
});

Deno.test("string input validation - comprehensive error message testing", () => {
  // Test that error messages include original string values for debugging
  const testCases = [
    { input: "invalid123", expectedInMessage: "invalid123" },
    { input: "123invalid", expectedInMessage: "123invalid" },
    { input: "", expectedInMessage: "empty string" },
  ];
  
  testCases.forEach(({ input, expectedInMessage }) => {
    try {
      validateAmountCents(input);
      // Should not reach here
      assertEquals(true, false, `Expected error for input: ${input}`);
    } catch (error) {
      assertEquals(
        (error as Error).message.includes(expectedInMessage),
        true,
        `Error message should include "${expectedInMessage}" for input "${input}". Got: ${(error as Error).message}`
      );
    }
  });
  
  // Test that whitespace inputs now work (no longer error cases)
  assertEquals(validateAmountCents(" 123"), 123);
  assertEquals(validateAmountCents("123 "), 123);
});

// Comprehensive tests for whitespace handling (Requirement 1.6)
Deno.test("convertToNumber - comprehensive whitespace handling", () => {
  // Leading whitespace
  assertEquals(convertToNumber(" 123", "Test"), 123);
  assertEquals(convertToNumber("  123", "Test"), 123);
  assertEquals(convertToNumber("\t123", "Test"), 123);
  assertEquals(convertToNumber("\n123", "Test"), 123);
  assertEquals(convertToNumber("\r123", "Test"), 123);
  
  // Trailing whitespace
  assertEquals(convertToNumber("123 ", "Test"), 123);
  assertEquals(convertToNumber("123  ", "Test"), 123);
  assertEquals(convertToNumber("123\t", "Test"), 123);
  assertEquals(convertToNumber("123\n", "Test"), 123);
  assertEquals(convertToNumber("123\r", "Test"), 123);
  
  // Both leading and trailing whitespace
  assertEquals(convertToNumber(" 123 ", "Test"), 123);
  assertEquals(convertToNumber("  123  ", "Test"), 123);
  assertEquals(convertToNumber("\t123\t", "Test"), 123);
  assertEquals(convertToNumber("\n123\n", "Test"), 123);
  assertEquals(convertToNumber("\r123\r", "Test"), 123);
  
  // Mixed whitespace types
  assertEquals(convertToNumber(" \t\n123\r \t", "Test"), 123);
  assertEquals(convertToNumber("\n\t 123.45 \t\n", "Test"), 123.45);
  
  // Decimal numbers with whitespace
  assertEquals(convertToNumber(" 123.45 ", "Test"), 123.45);
  assertEquals(convertToNumber("\t0.01\n", "Test"), 0.01);
  
  // Negative numbers with whitespace
  assertEquals(convertToNumber(" -123 ", "Test"), -123);
  assertEquals(convertToNumber("\t-123.45\n", "Test"), -123.45);
  
  // Zero with whitespace
  assertEquals(convertToNumber(" 0 ", "Test"), 0);
  assertEquals(convertToNumber("\t0\n", "Test"), 0);
});

Deno.test("validateAmountCents - comprehensive whitespace handling", () => {
  // Valid amounts with various whitespace patterns
  assertEquals(validateAmountCents(" 100"), 100);
  assertEquals(validateAmountCents("100 "), 100);
  assertEquals(validateAmountCents(" 100 "), 100);
  assertEquals(validateAmountCents("\t100\t"), 100);
  assertEquals(validateAmountCents("\n100\n"), 100);
  assertEquals(validateAmountCents(" \t\n100\r \t"), 100);
  
  // Zero with whitespace
  assertEquals(validateAmountCents(" 0 "), 0);
  assertEquals(validateAmountCents("\t0\n"), 0);
  
  // Large valid amounts with whitespace
  assertEquals(validateAmountCents(" 12345 "), 12345);
  assertEquals(validateAmountCents("\t999999\n"), 999999);
});

Deno.test("validateBasisPoints - comprehensive whitespace handling", () => {
  // Valid basis points with various whitespace patterns
  assertEquals(validateBasisPoints(" 1300"), 1300);
  assertEquals(validateBasisPoints("1300 "), 1300);
  assertEquals(validateBasisPoints(" 1300 "), 1300);
  assertEquals(validateBasisPoints("\t1300\t"), 1300);
  assertEquals(validateBasisPoints("\n1300\n"), 1300);
  assertEquals(validateBasisPoints(" \t\n1300\r \t"), 1300);
  
  // Zero with whitespace
  assertEquals(validateBasisPoints(" 0 "), 0);
  assertEquals(validateBasisPoints("\t0\n"), 0);
  
  // Common tax rates with whitespace
  assertEquals(validateBasisPoints(" 500 "), 500); // 5%
  assertEquals(validateBasisPoints("\t1000\n"), 1000); // 10%
  assertEquals(validateBasisPoints(" 10000 "), 10000); // 100%
});

Deno.test("convertToAmountCents - whitespace handling integration", () => {
  // Test that the conversion functions properly handle whitespace
  assertEquals(convertToAmountCents(" 100"), 100);
  assertEquals(convertToAmountCents("100 "), 100);
  assertEquals(convertToAmountCents(" 100 "), 100);
  assertEquals(convertToAmountCents("\t100\n"), 100);
  
  // Test that validation still applies after trimming
  assertThrows(
    () => convertToAmountCents(" -100 "),
    Error,
    "Amount cannot be negative"
  );
  
  assertThrows(
    () => convertToAmountCents(" 100.5 "),
    Error,
    "Amount in cents must be an integer"
  );
});

Deno.test("convertToBasisPoints - whitespace handling integration", () => {
  // Test that the conversion functions properly handle whitespace
  assertEquals(convertToBasisPoints(" 1300"), 1300);
  assertEquals(convertToBasisPoints("1300 "), 1300);
  assertEquals(convertToBasisPoints(" 1300 "), 1300);
  assertEquals(convertToBasisPoints("\t1300\n"), 1300);
  
  // Test that validation still applies after trimming
  assertThrows(
    () => convertToBasisPoints(" -1300 "),
    Error,
    "Basis points cannot be negative"
  );
  
  assertThrows(
    () => convertToBasisPoints(" 1300.5 "),
    Error,
    "Basis points must be an integer"
  );
});

// Test error message consistency for null/undefined vs invalid types (Requirements 1.1, 1.2)
Deno.test("error message consistency - null/undefined vs invalid types", () => {
  // Null/undefined should have specific error messages
  assertThrows(
    () => convertToNumber(null as unknown as string, "TestField"),
    Error,
    "TestField must be a string or number, received object"
  );
  
  assertThrows(
    () => convertToNumber(undefined as unknown as string, "TestField"),
    Error,
    "TestField must be a string or number, received undefined"
  );
  
  // Invalid types should have different error messages
  assertThrows(
    () => convertToNumber(true as unknown as string, "TestField"),
    Error,
    "TestField must be a string or number, received boolean"
  );
  
  assertThrows(
    () => convertToNumber({} as unknown as string, "TestField"),
    Error,
    "TestField must be a string or number, received object"
  );
  
  assertThrows(
    () => convertToNumber([] as unknown as string, "TestField"),
    Error,
    "TestField must be a string or number, received object"
  );
});

// Test that all existing validation logic applies after conversion (Requirement 1.4, 1.5)
Deno.test("validation logic applies after string conversion", () => {
  // NaN detection after string conversion
  assertThrows(
    () => convertToNumber("NaN", "Test"),
    Error,
    'Test "NaN" is not a valid number'
  );
  
  // Infinity detection after string conversion
  assertThrows(
    () => convertToNumber("Infinity", "Test"),
    Error,
    'Test "Infinity" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("-Infinity", "Test"),
    Error,
    'Test "-Infinity" is not a valid number'
  );
  
  // Invalid number strings
  assertThrows(
    () => convertToNumber("not-a-number", "Test"),
    Error,
    'Test "not-a-number" is not a valid number'
  );
  
  assertThrows(
    () => convertToNumber("123abc", "Test"),
    Error,
    'Test "123abc" is not a valid number'
  );
  
  // Amount-specific validation after conversion
  assertThrows(
    () => validateAmountCents(" -100 "),
    Error,
    "Amount cannot be negative"
  );
  
  assertThrows(
    () => validateAmountCents(" 100.5 "),
    Error,
    "Amount in cents must be an integer"
  );
  
  // Basis points-specific validation after conversion
  assertThrows(
    () => validateBasisPoints(" -1300 "),
    Error,
    "Basis points cannot be negative"
  );
  
  assertThrows(
    () => validateBasisPoints(" 1300.5 "),
    Error,
    "Basis points must be an integer"
  );
  
  assertThrows(
    () => validateBasisPoints(" 1000001 "),
    Error,
    "Basis points 1000001 exceeds reasonable maximum of 1000000 (10000%)"
  );
});

// Edge cases for whitespace handling
Deno.test("whitespace handling edge cases", () => {
  // Unicode whitespace characters
  assertEquals(convertToNumber("\u0020123\u0020", "Test"), 123); // Regular space
  assertEquals(convertToNumber("\u00A0123\u00A0", "Test"), 123); // Non-breaking space
  assertEquals(convertToNumber("\u2000123\u2000", "Test"), 123); // En quad
  assertEquals(convertToNumber("\u2001123\u2001", "Test"), 123); // Em quad
  
  // Mixed whitespace with valid numbers
  assertEquals(convertToNumber(" \t\r\n123.45\r\n\t ", "Test"), 123.45);
  
  // Scientific notation with whitespace
  assertEquals(convertToNumber(" 1e2 ", "Test"), 100);
  assertEquals(convertToNumber("\t1.23e2\n", "Test"), 123);
  
  // Negative numbers with whitespace
  assertEquals(convertToNumber(" -123.45 ", "Test"), -123.45);
  
  // Leading zeros with whitespace
  assertEquals(convertToNumber(" 0123 ", "Test"), 123);
  assertEquals(convertToNumber("\t00.45\n", "Test"), 0.45);
});