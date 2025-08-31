# Design Document

## Overview

The unified finance calculations utility library is designed around the principle of maintaining full mathematical precision throughout all calculations, conversions, and arithmetic operations. The library provides comprehensive string and number input support while ensuring exact mathematical accuracy. Rounding only occurs during formatting for display purposes using the round half up algorithm.

The library follows a modular architecture with clear separation of concerns and provides a complete solution for financial calculations that eliminates floating-point precision errors.

## Architecture

The library follows a layered modular architecture with clear separation of concerns:

```
mod.ts (main entry point)
├── src/
│   ├── types.ts (TypeScript definitions)
│   ├── constants.ts (mathematical constants)
│   ├── validation.ts (input validation and conversion)
│   ├── arithmetic.ts (safe arithmetic operations)
│   ├── conversions.ts (monetary and percentage conversions)
│   ├── calculations.ts (tax calculation functions)
│   └── format.ts (display formatting with rounding)
```

### Core Design Principles

1. **Full Mathematical Precision**: All internal calculations maintain complete mathematical precision using floating-point arithmetic
2. **String and Number Input Support**: All functions accept both string and number inputs with automatic conversion
3. **Late Rounding**: Rounding only occurs during formatting for display purposes
4. **Exact Mathematical Results**: All calculations return precise mathematical results without adjustments
5. **Safe Operations**: All operations include overflow protection and comprehensive validation
6. **Intelligent Formatting**: Display formatting includes smart rounding adjustments for better readability

## Components and Interfaces

### Core Types

```typescript
// Union type for flexible input support
type StringOrNumber = string | number;

// Monetary amount in cents (can be fractional for internal calculations)
type AmountCents = number;

// Tax rate in basis points (can be fractional for internal calculations)
type BasisPoints = number;

// Decimal amount for display (number with full precision)
type DecimalAmount = number;

// Calculation result with exact mathematical breakdown
interface TaxCalculationResult {
  baseAmountCents: AmountCents;
  taxAmountCents: AmountCents;
  totalAmountCents: AmountCents;
}

// Formatting options
interface FormatOptions {
  currencySymbol?: string;
  locale?: string;
}
```

### Validation

```typescript
// Input validation functions
function validateAmountCents(value: StringOrNumber): AmountCents;
function validateBasisPoints(value: StringOrNumber): BasisPoints;
function validateNumber(value: StringOrNumber, fieldName: string): number;

// String to number conversion (accepts strings with leading/trailing whitespace)
function convertToNumber(value: StringOrNumber, fieldName: string): number;
```

### Arithmetic Operations

```typescript
// Safe arithmetic operations with overflow protection
function safeAdd(a: AmountCents, b: AmountCents): AmountCents;
function safeSubtract(a: AmountCents, b: AmountCents): AmountCents;
function safeMultiply(amount: AmountCents, factor: number): AmountCents;
```

### Conversions

```typescript
// Monetary conversions
function decimalToCents(decimalAmount: StringOrNumber): AmountCents;
function centsToDecimal(cents: AmountCents): DecimalAmount;

// Percentage conversions
function percent100ToBasisPoints(percentage: StringOrNumber): BasisPoints;
function percent1ToBasisPoints(percentage: StringOrNumber): BasisPoints;
function basisPointsToPercent100(basisPoints: BasisPoints): number;
function basisPointsToPercent1(basisPoints: BasisPoints): number;
```

### Calculations

```typescript
// Core tax calculation functions with full mathematical precision
function calculateTaxFromBase(
  baseCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): AmountCents;

function calculateBaseFromTotal(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): AmountCents;

function calculateTaxBreakdown(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): TaxCalculationResult;
```

### Formatting

```typescript
// Display formatting with intelligent rounding
function formatCentsToNumber(cents: StringOrNumber): number;
function formatCentsWithCurrency(
  cents: StringOrNumber,
  currencySymbol?: string,
  locale?: string
): string;

function formatPercentToNumber(percent: number): number;
function formatPercentWithSymbol(percent: number): string;
```

## Data Models

### Mathematical Constants

```typescript
const CENTS_SCALE = 100; // 1 dollar = 100 cents
const BASIS_POINTS_SCALE = 10000; // 1 = 10000 basis points
const MAX_SAFE_CENTS = Math.floor(Number.MAX_SAFE_INTEGER / BASIS_POINTS_SCALE);
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY_SYMBOL = '$';
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
```

### Core Calculation Algorithms

#### Tax Calculation with Full Precision

```typescript
// Calculate tax from base amount maintaining full mathematical precision
function calculateTaxFromBase(baseCents: StringOrNumber, taxBasisPoints: StringOrNumber): AmountCents {
  const validBaseCents = validateAmountCents(baseCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Calculate tax using full precision: taxAmount = baseAmount * (taxBasisPoints / BASIS_POINTS_SCALE)
  const numerator = validBaseCents * validTaxBasisPoints;
  const taxCents = numerator / BASIS_POINTS_SCALE;

  return taxCents; // Return exact mathematical result with full precision
}
```

#### Base Calculation with Full Precision

```typescript
// Calculate base from total maintaining full mathematical precision
function calculateBaseFromTotal(totalCents: StringOrNumber, taxBasisPoints: StringOrNumber): AmountCents {
  const validTotalCents = validateAmountCents(totalCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Handle edge case: if tax rate is 0, base equals total
  if (validTaxBasisPoints === 0) {
    return validTotalCents;
  }

  // Calculate base using full precision: base = total / (1 + rate)
  // Where rate = taxBasisPoints / BASIS_POINTS_SCALE
  const scale = BASIS_POINTS_SCALE;
  const denominator = scale + validTaxBasisPoints;
  const baseCents = (validTotalCents * scale) / denominator;

  return baseCents; // Return exact mathematical result with full precision
}
```

#### Tax Breakdown with Mathematical Accuracy

```typescript
// Calculate complete tax breakdown with full mathematical precision
function calculateTaxBreakdown(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): TaxCalculationResult {
  const validTotalCents = validateAmountCents(totalCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);

  // Calculate base amount with full precision
  const baseAmountCents = calculateBaseFromTotal(validTotalCents, validTaxBasisPoints);
  
  // Calculate tax amount with full precision
  const taxAmountCents = calculateTaxFromBase(baseAmountCents, validTaxBasisPoints);

  return {
    baseAmountCents,
    taxAmountCents,
    totalAmountCents: validTotalCents
  };
}
```

### String Input Processing

```typescript
// Convert string or number to validated number (accepts strings with whitespace)
function convertToNumber(value: StringOrNumber, fieldName: string): number {
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error(`${fieldName} must be a finite number`);
    }
    return value;
  }
  
  if (typeof value === 'string') {
    if (value.trim() === '') {
      throw new Error(`${fieldName} cannot be empty string`);
    }
    
    const converted = Number(value); // Number constructor automatically trims whitespace
    if (Number.isNaN(converted)) {
      throw new Error(`${fieldName} "${value}" is not a valid number`);
    }
    
    return converted;
  }
  
  throw new Error(`${fieldName} must be a string or number, received ${typeof value}`);
}
```

### Intelligent Formatting Algorithm

```typescript
// Format with intelligent rounding adjustments using round half up
function formatCentsToNumber(cents: StringOrNumber): number {
  const validCents = convertToAmountCents(cents);
  const result = validCents / CENTS_SCALE;
  
  // Apply round half up rounding with intelligent adjustments for better readability
  return applyIntelligentAdjustment(result);
}

function applyIntelligentAdjustment(value: number): number {
  // First apply round half up to 2 decimal places
  const rounded = roundHalfUp(value, 2);
  
  // Check for values that can be improved by 1 cent adjustment
  const cents = Math.round(rounded * 100);
  const lastTwoDigits = cents % 100;
  
  // Adjust 99 cents to next dollar (e.g., 121.99 → 122.00)
  if (lastTwoDigits === 99) {
    return Math.ceil(rounded);
  }
  
  // Adjust 01 cents to previous dollar (e.g., 122.01 → 122.00)
  if (lastTwoDigits === 1) {
    return Math.floor(rounded);
  }
  
  // Adjust 49 cents to 50 cents (e.g., 56.49 → 56.50)
  if (lastTwoDigits === 49) {
    return rounded + 0.01;
  }
  
  return rounded;
}

function roundHalfUp(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  // Round half up: 0.5 rounds up to 1, -0.5 rounds up to 0
  return Math.round(value * factor + Number.EPSILON) / factor;
}
```

## Error Handling

### Validation Errors

- **InvalidInputError**: Thrown when inputs are not valid numbers or are outside acceptable ranges
- **OverflowError**: Thrown when operations would exceed safe integer limits
- **ConversionError**: Thrown when string inputs cannot be converted to valid numbers

### Error Messages

All error messages include:
- Clear description of the problem
- Expected input format
- Actual values received (when safe to display)
- Field name context for debugging

### Error Recovery

The library follows a fail-fast approach - invalid inputs immediately throw descriptive errors rather than attempting to coerce or guess correct values.

## Testing Strategy

### Unit Tests

1. **Calculation Accuracy**: Verify all calculations produce exact mathematical results with full precision
2. **String Input Support**: Test all functions with string inputs and verify equivalent results to number inputs
3. **Edge Cases**: Test boundary conditions, zero values, maximum safe integers
4. **Error Conditions**: Verify proper error handling for invalid inputs
5. **Precision Maintenance**: Ensure no precision loss in intermediate calculations

### Property-Based Tests

1. **Inverse Operations**: Verify that conversions are reversible where appropriate
2. **Mathematical Properties**: Test commutative, associative properties where applicable
3. **Boundary Testing**: Generate random values within safe ranges
4. **String Equivalence**: Verify string and number inputs produce identical results

### Integration Tests

1. **Real-World Scenarios**: Test with actual financial calculation examples
2. **Multiple Operations**: Verify precision across chains of operations
3. **Formatting Consistency**: Ensure formatted output maintains mathematical relationships
4. **Mixed Input Types**: Test functions with combinations of string and number inputs

### Performance Tests

1. **Large Numbers**: Test performance with maximum safe integer values
2. **String Conversion Overhead**: Measure performance impact of string processing
3. **Bulk Operations**: Test performance with arrays of calculations
4. **Memory Usage**: Verify no memory leaks in repeated operations

## Implementation Notes

### Precision Considerations

- All intermediate calculations maintain full floating-point precision
- No rounding occurs during calculations - only during formatting for display
- Mathematical accuracy is prioritized over display convenience
- Fractional cents are preserved throughout calculation chains

### String Input Processing

- Accepts string inputs with leading/trailing whitespace (leverages Number constructor's automatic trimming)
- Comprehensive validation of string-to-number conversion
- Descriptive error messages including original string values
- Zero performance impact on number-only operations

### Browser Compatibility

- Uses only standard JavaScript Number operations
- No external dependencies for core calculations
- Compatible with all modern JavaScript environments
- Leverages Intl.NumberFormat for locale-specific formatting

### Performance Optimizations

- Minimal object creation during calculations
- Reuse of mathematical constants
- Early validation to avoid expensive operations on invalid inputs
- Efficient string processing with single conversion per input

### Backward Compatibility

- All existing number-based APIs continue to work unchanged
- New string input support is additive, not breaking
- TypeScript types accurately reflect string | number union types
- Performance characteristics maintained for existing code paths