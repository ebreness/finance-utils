/**
 * Unit tests for conversion functions
 */

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  decimalToCents,
  centsToDecimal,
  percent100ToBasisPoints,
  percent1ToBasisPoints,
  basisPointsToPercent100,
  basisPointsToPercent1,
} from '../conversions.ts';

Deno.test("decimalToCents - valid conversions", () => {
  assertEquals(decimalToCents(0), 0);
  assertEquals(decimalToCents(1), 100);
  assertEquals(decimalToCents(1.23), 123);
  assertEquals(decimalToCents(123.45), 12345);
  assertEquals(decimalToCents(0.01), 1);
  assertEquals(decimalToCents(0.99), 99);
  assertEquals(decimalToCents(1000.00), 100000);
});

Deno.test("decimalToCents - handles floating point precision", () => {
  // Test cases that might have floating point precision issues
  assertEquals(decimalToCents(0.1), 10);
  assertEquals(decimalToCents(0.2), 20);
  assertEquals(decimalToCents(0.3), 30);
  assertEquals(decimalToCents(1.1), 110);
  assertEquals(decimalToCents(2.2), 220);
});

Deno.test("decimalToCents - error cases", () => {
  assertThrows(() => decimalToCents(null as any), Error, "cannot be null or undefined");
  assertThrows(() => decimalToCents(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => decimalToCents("123" as any), Error, "must be a number");
  assertThrows(() => decimalToCents(NaN), Error, "cannot be NaN");
  assertThrows(() => decimalToCents(Infinity), Error, "must be finite");
  assertThrows(() => decimalToCents(-1), Error, "cannot be negative");
  assertThrows(() => decimalToCents(Number.MAX_SAFE_INTEGER), Error, "exceeds maximum safe value");
});

Deno.test("centsToDecimal - valid conversions", () => {
  assertEquals(centsToDecimal(0), 0.00);
  assertEquals(centsToDecimal(1), 0.01);
  assertEquals(centsToDecimal(100), 1.00);
  assertEquals(centsToDecimal(123), 1.23);
  assertEquals(centsToDecimal(12345), 123.45);
  assertEquals(centsToDecimal(99), 0.99);
  assertEquals(centsToDecimal(100000), 1000.00);
});

Deno.test("centsToDecimal - error cases", () => {
  assertThrows(() => centsToDecimal(null as any), Error, "cannot be null or undefined");
  assertThrows(() => centsToDecimal(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => centsToDecimal("123" as any), Error, "must be a number");
  assertThrows(() => centsToDecimal(NaN), Error, "cannot be NaN");
  assertThrows(() => centsToDecimal(Infinity), Error, "must be finite");
  assertThrows(() => centsToDecimal(1.5), Error, "must be an integer");
  assertThrows(() => centsToDecimal(-1), Error, "cannot be negative");
});

Deno.test("percent100ToBasisPoints - valid conversions", () => {
  assertEquals(percent100ToBasisPoints(0), 0);
  assertEquals(percent100ToBasisPoints(1), 100);
  assertEquals(percent100ToBasisPoints(13), 1300);
  assertEquals(percent100ToBasisPoints(25.5), 2550);
  assertEquals(percent100ToBasisPoints(100), 10000);
  assertEquals(percent100ToBasisPoints(0.01), 1);
});

Deno.test("percent100ToBasisPoints - error cases", () => {
  assertThrows(() => percent100ToBasisPoints(null as any), Error, "cannot be null or undefined");
  assertThrows(() => percent100ToBasisPoints(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => percent100ToBasisPoints("13" as any), Error, "must be a number");
  assertThrows(() => percent100ToBasisPoints(NaN), Error, "cannot be NaN");
  assertThrows(() => percent100ToBasisPoints(Infinity), Error, "must be finite");
  assertThrows(() => percent100ToBasisPoints(-1), Error, "cannot be negative");
});

Deno.test("percent1ToBasisPoints - valid conversions", () => {
  assertEquals(percent1ToBasisPoints(0), 0);
  assertEquals(percent1ToBasisPoints(0.01), 100);
  assertEquals(percent1ToBasisPoints(0.13), 1300);
  assertEquals(percent1ToBasisPoints(0.255), 2550);
  assertEquals(percent1ToBasisPoints(1), 10000);
  assertEquals(percent1ToBasisPoints(0.0001), 1);
});

Deno.test("percent1ToBasisPoints - error cases", () => {
  assertThrows(() => percent1ToBasisPoints(null as any), Error, "cannot be null or undefined");
  assertThrows(() => percent1ToBasisPoints(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => percent1ToBasisPoints("0.13" as any), Error, "must be a number");
  assertThrows(() => percent1ToBasisPoints(NaN), Error, "cannot be NaN");
  assertThrows(() => percent1ToBasisPoints(Infinity), Error, "must be finite");
  assertThrows(() => percent1ToBasisPoints(-0.01), Error, "cannot be negative");
});

Deno.test("basisPointsToPercent100 - valid conversions", () => {
  assertEquals(basisPointsToPercent100(0), 0);
  assertEquals(basisPointsToPercent100(100), 1);
  assertEquals(basisPointsToPercent100(1300), 13);
  assertEquals(basisPointsToPercent100(2550), 25.5);
  assertEquals(basisPointsToPercent100(10000), 100);
  assertEquals(basisPointsToPercent100(1), 0.01);
});

Deno.test("basisPointsToPercent100 - error cases", () => {
  assertThrows(() => basisPointsToPercent100(null as any), Error, "cannot be null or undefined");
  assertThrows(() => basisPointsToPercent100(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => basisPointsToPercent100("1300" as any), Error, "must be a number");
  assertThrows(() => basisPointsToPercent100(NaN), Error, "cannot be NaN");
  assertThrows(() => basisPointsToPercent100(Infinity), Error, "must be finite");
  assertThrows(() => basisPointsToPercent100(1.5), Error, "must be an integer");
  assertThrows(() => basisPointsToPercent100(-1), Error, "cannot be negative");
});

Deno.test("basisPointsToPercent1 - valid conversions", () => {
  assertEquals(basisPointsToPercent1(0), 0);
  assertEquals(basisPointsToPercent1(100), 0.01);
  assertEquals(basisPointsToPercent1(1300), 0.13);
  assertEquals(basisPointsToPercent1(2550), 0.255);
  assertEquals(basisPointsToPercent1(10000), 1);
  assertEquals(basisPointsToPercent1(1), 0.0001);
});

Deno.test("basisPointsToPercent1 - error cases", () => {
  assertThrows(() => basisPointsToPercent1(null as any), Error, "cannot be null or undefined");
  assertThrows(() => basisPointsToPercent1(undefined as any), Error, "cannot be null or undefined");
  assertThrows(() => basisPointsToPercent1("1300" as any), Error, "must be a number");
  assertThrows(() => basisPointsToPercent1(NaN), Error, "cannot be NaN");
  assertThrows(() => basisPointsToPercent1(Infinity), Error, "must be finite");
  assertThrows(() => basisPointsToPercent1(1.5), Error, "must be an integer");
  assertThrows(() => basisPointsToPercent1(-1), Error, "cannot be negative");
});

// Test round-trip conversions
Deno.test("round-trip conversions - decimal to cents and back", () => {
  const testValues = [0, 1, 1.23, 123.45, 0.01, 0.99, 1000.00];
  
  for (const value of testValues) {
    const cents = decimalToCents(value);
    const backToDecimal = centsToDecimal(cents);
    assertEquals(backToDecimal, value, `Round-trip failed for ${value}`);
  }
});

Deno.test("round-trip conversions - percent100 to basis points and back", () => {
  const testValues = [0, 1, 13, 25.5, 100, 0.01];
  
  for (const value of testValues) {
    const basisPoints = percent100ToBasisPoints(value);
    const backToPercent = basisPointsToPercent100(basisPoints);
    assertEquals(backToPercent, value, `Round-trip failed for ${value}%`);
  }
});

Deno.test("round-trip conversions - percent1 to basis points and back", () => {
  const testValues = [0, 0.01, 0.13, 0.255, 1, 0.0001];
  
  for (const value of testValues) {
    const basisPoints = percent1ToBasisPoints(value);
    const backToPercent = basisPointsToPercent1(basisPoints);
    assertEquals(backToPercent, value, `Round-trip failed for ${value}`);
  }
});