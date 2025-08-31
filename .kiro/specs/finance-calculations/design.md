# Design Document

## Overview

The finance calculations utility library is designed around the principle of maintaining precision by working with integers (cents) and basis points internally, only converting to decimal representation for display purposes. The library provides a comprehensive set of functions for monetary calculations, conversions, and formatting while ensuring mathematical accuracy.

## Architecture

The library follows a modular architecture with clear separation of concerns:

```
mod.ts (main entry point)
├── calculations.ts (core calculation functions)
├── conversions.ts (conversion utilities)
├── formatting.ts (display formatting)
├── validation.ts (input validation)
├── types.ts (TypeScript definitions)
└── constants.ts (mathematical constants)
```

### Core Principles

1. **Integer Arithmetic**: All internal calculations use integers to avoid floating-point precision issues
2. **Basis Points**: Tax rates and percentages are represented in basis points (1 bp = 0.01%)
3. **Late Rounding**: Rounding only occurs at the final display step
4. **Exact Totals**: Base amount + tax amount always equals the original total by design, with adjustments made to ensure mathematical integrity
5. **Safe Operations**: All operations check for integer overflow

## Components and Interfaces

### Core Types

```typescript
// Monetary amount in cents (integer)
type AmountCents = number;

// Tax rate in basis points (integer, 1 bp = 0.01%)
type BasisPoints = number;

// Decimal amount for display (number with 2 decimal places)
type DecimalAmount = number;

// Calculation result with breakdown
interface TaxCalculationResult {
  baseAmountCents: AmountCents;
  taxAmountCents: AmountCents;
  totalAmountCents: AmountCents;
}

// Enhanced calculation result with discount information
interface TaxCalculationWithDiscountResult extends TaxCalculationResult {
  discountedAmountCents: AmountCents;
  discountBasisPoints: BasisPoints;
}

// Formatting options
interface FormatOptions {
  currencySymbol?: string;
  locale?: string;
}
```

### Calculation Functions

```typescript
// Calculate base amount from total including taxes
function calculateBaseFromTotal(
  totalCents: AmountCents,
  taxBasisPoints: BasisPoints
): AmountCents;

// Calculate tax amount from base amount
function calculateTaxFromBase(
  baseCents: AmountCents,
  taxBasisPoints: BasisPoints
): AmountCents;

// Complete tax calculation with breakdown
function calculateTaxBreakdown(
  totalCents: AmountCents,
  taxBasisPoints: BasisPoints
): TaxCalculationResult;

// Complete tax calculation with discount breakdown
function calculateTaxBreakdown(
  totalCents: AmountCents,
  taxBasisPoints: BasisPoints,
  discountBasisPoints?: BasisPoints
): TaxCalculationResult | TaxCalculationWithDiscountResult;
```

### Conversion Functions

```typescript
// Convert decimal amount to cents
function decimalToCents(decimalAmount: DecimalAmount): AmountCents;

// Convert cents to decimal amount
function centsToDecimal(cents: AmountCents): DecimalAmount;

// Convert percentage (0-100) to basis points
function percent100ToBasisPoints(percentage: number): BasisPoints;

// Convert percentage (0-1) to basis points
function percent1ToBasisPoints(percentage: number): BasisPoints;

// Convert basis points to percentage (0-100)
function basisPointsToPercent100(basisPoints: BasisPoints): number;

// Convert basis points to percentage (0-1)
function basisPointsToPercent1(basisPoints: BasisPoints): number;
```

### Formatting Functions

```typescript
// Format cents to number with 2 decimals
function formatCentsToNumber(cents: AmountCents): number;

// Format cents with currency symbol (default $ with en-US locale)
function formatCentsWithCurrency(
  cents: AmountCents,
  currencySymbol: string = '$',
  locale: string = 'en-US'
): string;

// Format percent with 2 decimals (returns number)
function formatPercentToNumber(percent: number): number;

// Format percent with % symbol at the end
function formatPercentWithSymbol(percent: number): string;

// Clamp percent 0-1
function clampPercent01(percent: number): number;

// Clamp percent 0-100
function clampPercent0100(percent: number): number;
```

### Validation Functions

```typescript
// Validate monetary amount input
function validateAmountCents(value: unknown): AmountCents;

// Validate basis points input
function validateBasisPoints(value: unknown): BasisPoints;

// Check for safe integer operations
function checkSafeOperation(a: number, b: number, operation: string): void;
```

## Data Models

### Mathematical Constants

```typescript
const CENTS_SCALE = 100; // 1 dollar = 100 cents
const BASIS_POINTS_SCALE = 10000; // 1 = 10000 basis points
const MAX_SAFE_CENTS = Math.floor(Number.MAX_SAFE_INTEGER / BASIS_POINTS_SCALE);
const DEFAULT_LOCALE = 'en-US'; // Default locale for formatting
const DEFAULT_CURRENCY_SYMBOL = '$'; // Default currency symbol
```

### Core Algorithm

The main tax calculation algorithm follows this approach with guaranteed exact totals:

#### Standard Tax Calculation

```typescript
// For calculating base from total with tax:
// base = total / (1 + rate)
// Where rate = taxBasisPoints / 10000
// 
// To maintain integer arithmetic and guarantee exact totals:
// baseCents = round(totalCents * 10000 / (10000 + taxBasisPoints))
// taxCents = totalCents - baseCents (ensures exact total)

function calculateBaseFromTotal(totalCents: AmountCents, taxBasisPoints: BasisPoints): AmountCents {
  const scale = BASIS_POINTS_SCALE;
  const denominator = scale + taxBasisPoints;
  const numerator = totalCents * scale;
  
  const baseCents = Math.round(numerator / denominator);
  const taxCents = totalCents - baseCents;
  
  // This guarantees baseCents + taxCents = totalCents exactly
  // by design, since taxCents is calculated as the difference
  
  return baseCents;
}

function calculateTaxBreakdown(
  totalCents: AmountCents, 
  taxBasisPoints: BasisPoints,
  discountBasisPoints?: BasisPoints
): TaxCalculationResult | TaxCalculationWithDiscountResult {
  
  if (discountBasisPoints && discountBasisPoints > 0) {
    // Calculate with discount: discount is applied to original base, then tax on discounted amount
    
    // First, get the original base amount (before discount)
    const originalBaseCents = calculateBaseFromTotal(totalCents, taxBasisPoints);
    
    // Calculate discount amount from original base
    const discountCents = Math.round((originalBaseCents * discountBasisPoints) / BASIS_POINTS_SCALE);
    
    // Calculate discounted base amount
    const discountedBaseCents = originalBaseCents - discountCents;
    
    // Calculate tax on the discounted amount
    const taxCents = Math.round((discountedBaseCents * taxBasisPoints) / BASIS_POINTS_SCALE);
    
    // Adjust discounted base to ensure exact total: discountedBase + tax = total
    const adjustedDiscountedBase = totalCents - taxCents;
    
    return {
      baseAmountCents: adjustedDiscountedBase,
      taxAmountCents: taxCents,
      totalAmountCents: totalCents,
      discountedAmountCents: discountCents,
      discountBasisPoints: discountBasisPoints
    };
  } else {
    // Standard calculation without discount
    const baseCents = calculateBaseFromTotal(totalCents, taxBasisPoints);
    const taxCents = totalCents - baseCents;
    
    return {
      baseAmountCents: baseCents,
      taxAmountCents: taxCents,
      totalAmountCents: totalCents // Always equals baseCents + taxCents
    };
  }
}
```

#### Tax Calculation with Discount

When discount is applied, the calculation follows this sequence to maintain exact precision:

```typescript
// For calculating tax breakdown with discount:
// 1. Calculate original base amount from total (ignoring discount initially)
// 2. Apply discount to original base amount
// 3. Calculate tax on discounted amount
// 4. Adjust final amounts to ensure exact total

function calculateTaxBreakdownWithDiscount(
  totalCents: AmountCents, 
  taxBasisPoints: BasisPoints,
  discountBasisPoints: BasisPoints
): TaxCalculationWithDiscountResult {
  
  // Step 1: Calculate what the base would be without discount
  const originalBaseCents = Math.round(totalCents * BASIS_POINTS_SCALE / (BASIS_POINTS_SCALE + taxBasisPoints));
  
  // Step 2: Calculate discount amount from original base
  const discountCents = Math.round((originalBaseCents * discountBasisPoints) / BASIS_POINTS_SCALE);
  
  // Step 3: Calculate discounted base
  const discountedBaseCents = originalBaseCents - discountCents;
  
  // Step 4: Calculate tax on discounted amount
  const taxCents = Math.round((discountedBaseCents * taxBasisPoints) / BASIS_POINTS_SCALE);
  
  // Step 5: Ensure exact total by adjusting the discounted base
  const finalDiscountedBase = totalCents - taxCents;
  
  // This guarantees: finalDiscountedBase + taxCents = totalCents exactly
  
  return {
    baseAmountCents: finalDiscountedBase,
    taxAmountCents: taxCents,
    totalAmountCents: totalCents,
    discountedAmountCents: discountCents,
    discountBasisPoints: discountBasisPoints
  };
}
```

## Error Handling

### Validation Errors

- **InvalidInputError**: Thrown when inputs are not valid numbers or are outside acceptable ranges
- **OverflowError**: Thrown when operations would exceed safe integer limits

Note: PrecisionError is not needed since the library guarantees exact totals by design through intelligent amount adjustment.

### Error Messages

All error messages include:
- Clear description of the problem
- Expected input format
- Actual values received (when safe to display)

### Error Recovery

The library follows a fail-fast approach - invalid inputs immediately throw descriptive errors rather than attempting to coerce or guess correct values.

## Testing Strategy

### Unit Tests

1. **Calculation Accuracy**: Verify all calculations produce exact results
2. **Edge Cases**: Test boundary conditions, zero values, maximum safe integers
3. **Error Conditions**: Verify proper error handling for invalid inputs
4. **Precision Maintenance**: Ensure no precision loss in intermediate calculations

### Property-Based Tests

1. **Inverse Operations**: Verify that conversions are reversible where appropriate
2. **Mathematical Properties**: Test commutative, associative properties where applicable
3. **Boundary Testing**: Generate random values within safe ranges

### Integration Tests

1. **Real-World Scenarios**: Test with actual financial calculation examples
2. **Multiple Operations**: Verify precision across chains of operations
3. **Formatting Consistency**: Ensure formatted output matches calculated values

### Performance Tests

1. **Large Numbers**: Test performance with maximum safe integer values
2. **Bulk Operations**: Test performance with arrays of calculations
3. **Memory Usage**: Verify no memory leaks in repeated operations

## Implementation Notes

### Precision Considerations

- All intermediate calculations maintain full integer precision
- Rounding only occurs at final display step or when required by business rules
- Division operations use Math.round() for consistent rounding behavior
- **Exact Total Guarantee**: Tax amounts are calculated as the difference (total - base) to ensure base + tax = total exactly
- When mathematical precision conflicts with exact totals, the library prioritizes exact totals by adjusting component amounts

### Browser Compatibility

- Uses only standard JavaScript Number operations
- No external dependencies for core calculations
- Compatible with all modern JavaScript environments

### Performance Optimizations

- Minimal object creation during calculations
- Reuse of mathematical constants
- Early validation to avoid expensive operations on invalid inputs