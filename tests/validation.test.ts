/**
 * Unit tests for validation functions
 */

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { validateAmountCents, validateBasisPoints, checkSafeOperation, validateNumber, validateIntegerForFormatting, validateNumberForFormatting } from '../validation.ts';
import { MAX_SAFE_CENTS } from '../constants.ts';

Deno.test("validateAmountCents - valid inputs", () => {
  assertEquals(validateAmountCents(0), 0);
  assertEquals(validateAmountCents(100), 100);
  assertEquals(validateAmountCents(12345), 12345);
  assertEquals(validateAmountCents(MAX_SAFE_CENTS), MAX_SAFE_CENTS);
});

Deno.test("validateAmountCents - null and undefined", () => {
  assertThrows(
    () => validateAmountCents(null),
    Error,
    "Amount cannot be null or undefined"
  );
  
  assertThrows(
    () => validateAmountCents(undefined),
    Error,
    "Amount cannot be null or undefined"
  );
});

Deno.test("validateAmountCents - non-number types", () => {
  assertThrows(
    () => validateAmountCents("123"),
    Error,
    "Amount must be a number, received string"
  );
  
  assertThrows(
    () => validateAmountCents(true),
    Error,
    "Amount must be a number, received boolean"
  );
  
  assertThrows(
    () => validateAmountCents({}),
    Error,
    "Amount must be a number, received object"
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

Deno.test("validateBasisPoints - null and undefined", () => {
  assertThrows(
    () => validateBasisPoints(null),
    Error,
    "Basis points cannot be null or undefined"
  );
  
  assertThrows(
    () => validateBasisPoints(undefined),
    Error,
    "Basis points cannot be null or undefined"
  );
});

Deno.test("validateBasisPoints - non-number types", () => {
  assertThrows(
    () => validateBasisPoints("1300"),
    Error,
    "Basis points must be a number, received string"
  );
  
  assertThrows(
    () => validateBasisPoints(false),
    Error,
    "Basis points must be a number, received boolean"
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

Deno.test("validateNumber - null and undefined", () => {
  assertThrows(() => validateNumber(null, "Test"), Error, "Test cannot be null or undefined");
  assertThrows(() => validateNumber(undefined, "Test"), Error, "Test cannot be null or undefined");
});

Deno.test("validateNumber - non-number types", () => {
  assertThrows(() => validateNumber("123", "Test"), Error, "Test must be a number, received string");
  assertThrows(() => validateNumber(true, "Test"), Error, "Test must be a number, received boolean");
  assertThrows(() => validateNumber({}, "Test"), Error, "Test must be a number, received object");
  assertThrows(() => validateNumber([], "Test"), Error, "Test must be a number, received object");
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