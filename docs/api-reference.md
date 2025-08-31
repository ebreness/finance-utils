# API Reference

This document provides comprehensive documentation for all methods available in the finance-calculations library.

## Exact Precision Guarantee

**THE CORE PROMISE: All tax calculation functions guarantee that base + tax = total EXACTLY**

Every tax calculation function in this library maintains absolute mathematical precision:

```typescript
// This relationship is ALWAYS true for ANY input values:
const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
```

This guarantee is maintained through:
- Integer arithmetic using cents and basis points
- Tax amounts calculated as differences rather than percentages when needed
- Intelligent adjustment of component amounts to maintain exact totals
- No intermediate rounding that could introduce errors

## Table of Contents

- [Types](#types)
- [Constants](#constants)
- [Validation Functions](#validation-functions)
- [String Conversion Functions](#string-conversion-functions)
- [Conversion Functions](#conversion-functions)
- [Arithmetic Functions](#arithmetic-functions)
- [Tax Calculation Functions](#tax-calculation-functions)
- [Formatting Functions](#formatting-functions)

## Types

### AmountCents
```typescript
type AmountCents = number;
```
Monetary amount represented in cents (integer). Example: $123.45 = 12345 cents.

### BasisPoints
```typescript
type BasisPoints = number;
```
Tax rate or percentage represented in basis points (integer). 1 basis point = 0.01%. Example: 13% = 1300 basis points.

### DecimalAmount
```typescript
type DecimalAmount = number;
```
Decimal amount for display purposes (number with 2 decimal places). Example: 123.45.

### StringOrNumber
```typescript
type StringOrNumber = string | number;
```
Union type for inputs that can be either string or number. Used to support string inputs that will be converted to numbers.

### TaxCalculationResult
```typescript
interface TaxCalculationResult {
  baseAmountCents: AmountCents;
  taxAmountCents: AmountCents;
  totalAmountCents: AmountCents;
}
```
Result of tax calculation with complete breakdown.

### TaxCalculationWithDiscountResult
```typescript
interface TaxCalculationWithDiscountResult extends TaxCalculationResult {
  discountedAmountCents: AmountCents;
  discountBasisPoints: BasisPoints;
}
```
Result of tax calculation with discount information included. Extends TaxCalculationResult to include discount-specific fields.

### FormatOptions
```typescript
interface FormatOptions {
  currencySymbol?: string;
  locale?: string;
}
```
Options for formatting monetary amounts and percentages.

## Constants

### CENTS_SCALE
```typescript
const CENTS_SCALE = 100;
```
Scale factor for converting between dollars and cents.

### BASIS_POINTS_SCALE
```typescript
const BASIS_POINTS_SCALE = 10000;
```
Scale factor for basis points (1 basis point = 0.01%).

### MAX_SAFE_CENTS
```typescript
const MAX_SAFE_CENTS = 90071992547409;
```
Maximum safe monetary amount in cents.

### DEFAULT_CURRENCY_SYMBOL
```typescript
const DEFAULT_CURRENCY_SYMBOL = '$';
```
Default currency symbol for formatting.

### DEFAULT_LOCALE
```typescript
const DEFAULT_LOCALE = 'en-US';
```
Default locale for number formatting.

## Validation Functions

### validateAmountCents(value)
Validates that a value is a valid monetary amount in cents.

**Parameters:**
- `value: unknown` - The value to validate

**Returns:** `AmountCents` - The validated amount in cents

**Throws:** Error if the value is invalid

**Example:**
```typescript
validateAmountCents(12345); // returns 12345
validateAmountCents(-100); // throws Error: Amount cannot be negative
```

### validateBasisPoints(value)
Validates that a value is a valid tax rate in basis points.

**Parameters:**
- `value: unknown` - The value to validate

**Returns:** `BasisPoints` - The validated basis points

**Throws:** Error if the value is invalid

**Example:**
```typescript
validateBasisPoints(1300); // returns 1300 (13%)
validateBasisPoints(-100); // throws Error: Basis points cannot be negative
```

## String Conversion Functions

### convertToNumber(value, fieldName)
Converts a string or number to a validated number with comprehensive error handling.

**Parameters:**
- `value: StringOrNumber` - String or number input to convert
- `fieldName: string` - Field name for descriptive error messages

**Returns:** `number` - Converted and validated number

**Throws:** Error if conversion fails or validation fails

**Example:**
```typescript
convertToNumber("123.45", "Amount"); // returns 123.45
convertToNumber("  1000  ", "Price"); // returns 1000 (whitespace trimmed)
convertToNumber(123, "Value"); // returns 123 (numbers pass through)
convertToNumber("invalid", "Test"); // throws Error: Test "invalid" is not a valid number
convertToNumber("", "Amount"); // throws Error: Amount cannot be empty string
```

### convertToAmountCents(value)
Converts string or number to AmountCents with full validation.

**Parameters:**
- `value: StringOrNumber` - String or number input representing monetary amount in cents

**Returns:** `AmountCents` - Validated AmountCents

**Throws:** Error if conversion or validation fails

**Example:**
```typescript
convertToAmountCents("12345"); // returns 12345
convertToAmountCents("  1000  "); // returns 1000 (whitespace trimmed)
convertToAmountCents(12345); // returns 12345 (numbers pass through)
convertToAmountCents("123.45"); // throws Error: Amount in cents must be an integer
convertToAmountCents("-100"); // throws Error: Amount cannot be negative
convertToAmountCents("invalid"); // throws Error: Amount "invalid" is not a valid number
```

### convertToBasisPoints(value)
Converts string or number to BasisPoints with full validation.

**Parameters:**
- `value: StringOrNumber` - String or number input representing tax rate in basis points

**Returns:** `BasisPoints` - Validated BasisPoints

**Throws:** Error if conversion or validation fails

**Example:**
```typescript
convertToBasisPoints("1300"); // returns 1300 (13%)
convertToBasisPoints("  1300  "); // returns 1300 (whitespace trimmed)
convertToBasisPoints(1300); // returns 1300 (numbers pass through)
convertToBasisPoints("13.5"); // throws Error: Basis points must be an integer
convertToBasisPoints("-100"); // throws Error: Basis points cannot be negative
convertToBasisPoints("invalid"); // throws Error: Basis points "invalid" is not a valid number
```

## Conversion Functions

### decimalToCents(decimalAmount)
Converts a decimal amount to cents (integer).

**Parameters:**
- `decimalAmount: DecimalAmount` - The decimal amount to convert (e.g., 123.45)

**Returns:** `AmountCents` - The amount in cents (e.g., 12345)

**Example:**
```typescript
decimalToCents(123.45); // returns 12345
decimalToCents(1.00); // returns 100
```

### centsToDecimal(cents)
Converts cents (integer) to a decimal amount with exactly 2 decimal places.

**Parameters:**
- `cents: AmountCents` - The amount in cents (e.g., 12345)

**Returns:** `DecimalAmount` - The decimal amount (e.g., 123.45)

**Example:**
```typescript
centsToDecimal(12345); // returns 123.45
centsToDecimal(100); // returns 1.00
```

### percent100ToBasisPoints(percentage)
Converts a percentage in 0-100 format to basis points.

**Parameters:**
- `percentage: number` - The percentage value (e.g., 13 for 13%)

**Returns:** `BasisPoints` - The value in basis points (e.g., 1300 for 13%)

**Example:**
```typescript
percent100ToBasisPoints(13); // returns 1300
percent100ToBasisPoints(5.5); // returns 550
```

### percent1ToBasisPoints(percentage)
Converts a percentage in 0-1 format to basis points.

**Parameters:**
- `percentage: number` - The percentage value (e.g., 0.13 for 13%)

**Returns:** `BasisPoints` - The value in basis points (e.g., 1300 for 13%)

**Example:**
```typescript
percent1ToBasisPoints(0.13); // returns 1300
percent1ToBasisPoints(0.055); // returns 550
```

### basisPointsToPercent100(basisPoints)
Converts basis points to percentage in 0-100 format.

**Parameters:**
- `basisPoints: BasisPoints` - The value in basis points (e.g., 1300 for 13%)

**Returns:** `number` - The percentage value (e.g., 13 for 13%)

**Example:**
```typescript
basisPointsToPercent100(1300); // returns 13
basisPointsToPercent100(550); // returns 5.5
```

### basisPointsToPercent1(basisPoints)
Converts basis points to percentage in 0-1 format.

**Parameters:**
- `basisPoints: BasisPoints` - The value in basis points (e.g., 1300 for 13%)

**Returns:** `number` - The percentage value (e.g., 0.13 for 13%)

**Example:**
```typescript
basisPointsToPercent1(1300); // returns 0.13
basisPointsToPercent1(550); // returns 0.055
```

## Arithmetic Functions

### safeAdd(a, b)
Safely add two monetary amounts in cents.

**Parameters:**
- `a: AmountCents` - First amount in cents
- `b: AmountCents` - Second amount in cents

**Returns:** `AmountCents` - Sum of the two amounts in cents

**Example:**
```typescript
safeAdd(12345, 6789); // returns 19134
safeAdd(100, 200); // returns 300
```

### safeSubtract(a, b)
Safely subtract two monetary amounts in cents.

**Parameters:**
- `a: AmountCents` - Amount to subtract from (minuend) in cents
- `b: AmountCents` - Amount to subtract (subtrahend) in cents

**Returns:** `AmountCents` - Difference of the two amounts in cents

**Example:**
```typescript
safeSubtract(12345, 6789); // returns 5556
safeSubtract(1000, 200); // returns 800
```

### safeMultiply(amount, factor)
Safely multiply a monetary amount by a factor with proper rounding.

**Parameters:**
- `amount: AmountCents` - Amount in cents to multiply
- `factor: number` - Factor to multiply by (can be decimal)

**Returns:** `AmountCents` - Product rounded to nearest cent

**Example:**
```typescript
safeMultiply(12345, 2); // returns 24690
safeMultiply(12345, 1.5); // returns 18518 (rounded from 18517.5)
safeMultiply(100, 0.13); // returns 13
```

## Tax Calculation Functions

**ALL TAX FUNCTIONS GUARANTEE EXACT PRECISION: base + tax = total EXACTLY**

### calculateTaxFromBase(baseCents, taxBasisPoints)
Calculate tax amount from base amount using basis points with EXACT PRECISION.

**Parameters:**
- `baseCents: AmountCents` - Base amount in cents (before taxes)
- `taxBasisPoints: BasisPoints` - Tax rate in basis points (1300 = 13%)

**Returns:** `AmountCents` - Tax amount in cents

**Precision Guarantee:** When used with `calculateBaseFromTotal`, guarantees base + tax = total exactly.

**Example:**
```typescript
calculateTaxFromBase(100000, 1300); // returns 13000 (13% of $1000.00 = $130.00)
calculateTaxFromBase(2831858, 1300); // returns 368142 (13% of $28,318.58 = $3,681.42)

// Exact precision example:
const total = 3200000;
const taxRate = 1300;
const base = calculateBaseFromTotal(total, taxRate); // 2831858
const tax = calculateTaxFromBase(base, taxRate);     // 368142
console.log(base + tax === total); // true - EXACT PRECISION GUARANTEED
```

### calculateBaseFromTotal(totalCents, taxBasisPoints)
Calculate base amount from total amount including taxes with EXACT PRECISION GUARANTEE.

**Parameters:**
- `totalCents: AmountCents` - Total amount including taxes in cents
- `taxBasisPoints: BasisPoints` - Tax rate in basis points (1300 = 13%)

**Returns:** `AmountCents` - Base amount in cents (before taxes)

**Precision Guarantee:** Tax calculated as (total - base) will always satisfy: base + tax = total exactly.

**Example:**
```typescript
calculateBaseFromTotal(3200000, 1300); // returns 2831858 (base: $28,318.58, tax: $3,681.42)
calculateBaseFromTotal(113000, 1300); // returns 100000 (base: $1,000.00, tax: $130.00)

// Exact precision guarantee:
const total = 3200000;
const base = calculateBaseFromTotal(total, 1300); // 2831858
const tax = total - base; // 368142 (calculated as difference)
console.log(base + tax === total); // true - GUARANTEED EXACT PRECISION
```

### calculateTaxBreakdown(totalCents, taxBasisPoints)
Calculate comprehensive tax breakdown with ABSOLUTE EXACT PRECISION GUARANTEE.

**Parameters:**
- `totalCents: AmountCents` - Total amount including taxes in cents
- `taxBasisPoints: BasisPoints` - Tax rate in basis points (1300 = 13%)

**Returns:** `TaxCalculationResult` - Complete tax calculation breakdown

**Precision Guarantee:** STRONGEST guarantee in the library - baseAmountCents + taxAmountCents = totalAmountCents (ALWAYS TRUE).

**Example:**
```typescript
calculateTaxBreakdown(3200000, 1300);
// returns { baseAmountCents: 2831858, taxAmountCents: 368142, totalAmountCents: 3200000 }

calculateTaxBreakdown(113000, 1300);
// returns { baseAmountCents: 100000, taxAmountCents: 13000, totalAmountCents: 113000 }

// GUARANTEED exact precision - this will ALWAYS be true:
const breakdown = calculateTaxBreakdown(3200000, 1300);
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
console.log(2831858 + 368142 === 3200000); // true

// Works with ANY input values:
const anyBreakdown = calculateTaxBreakdown(999999, 1234);
console.log(anyBreakdown.baseAmountCents + anyBreakdown.taxAmountCents === anyBreakdown.totalAmountCents); // true
```

### calculateTaxBreakdown(totalCents, taxBasisPoints, discountBasisPoints)
Calculate comprehensive tax breakdown with discount support and ABSOLUTE EXACT PRECISION GUARANTEE.

**Parameters:**
- `totalCents: AmountCents` - Total amount including taxes in cents
- `taxBasisPoints: BasisPoints` - Tax rate in basis points (1300 = 13%)
- `discountBasisPoints: BasisPoints` - Discount rate in basis points (500 = 5%)

**Returns:** `TaxCalculationWithDiscountResult` - Complete tax calculation breakdown with discount information

**Precision Guarantee:** baseAmountCents + taxAmountCents = totalAmountCents (ALWAYS TRUE)

**Discount Calculation Logic:**
1. Calculate original base amount (ignoring discount initially)
2. Apply discount to original base amount
3. Calculate tax on discounted amount
4. Adjust final amounts to ensure exact total

**Example:**
```typescript
// $122.00 with 13% tax and 5% discount
calculateTaxBreakdown(12200, 1300, 500);
// returns { 
//   baseAmountCents: 10797, 
//   taxAmountCents: 1403, 
//   totalAmountCents: 12200,
//   discountedAmountCents: 570,
//   discountBasisPoints: 500
// }

// $32,000.00 with 13% tax and 5% discount
calculateTaxBreakdown(3200000, 1300, 500);
// returns { 
//   baseAmountCents: 2690265, 
//   taxAmountCents: 509735, 
//   totalAmountCents: 3200000,
//   discountedAmountCents: 141593,
//   discountBasisPoints: 500
// }

// GUARANTEED exact precision with discount:
const breakdown = calculateTaxBreakdown(12200, 1300, 500);
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true

// Discount information is preserved:
console.log(breakdown.discountedAmountCents); // 570 ($5.70 discount)
console.log(breakdown.discountBasisPoints); // 500 (5% discount rate)

// String inputs supported:
calculateTaxBreakdown("12200", "1300", "500"); // Same result as above
```

## Formatting Functions

### formatCentsToNumber(cents)
Format cents to number with exactly 2 decimal places.

**Parameters:**
- `cents: AmountCents` - Amount in cents (integer, can be negative)

**Returns:** `number` - Number with exactly 2 decimal places

**Example:**
```typescript
formatCentsToNumber(12345); // returns 123.45
formatCentsToNumber(100); // returns 1.00
formatCentsToNumber(0); // returns 0.00
formatCentsToNumber(-12345); // returns -123.45
```

### formatPercentToNumber(percent)
Format percentage to number with 2 decimal precision.

**Parameters:**
- `percent: number` - Percentage value (can be 0-1 or 0-100 range, can be negative)

**Returns:** `number` - Number with exactly 2 decimal places

**Example:**
```typescript
formatPercentToNumber(13.456); // returns 13.46
formatPercentToNumber(0.13456); // returns 0.13
formatPercentToNumber(100); // returns 100.00
```

### formatCentsWithCurrency(cents, currencySymbol?, locale?)
Format cents with currency symbol using locale-specific formatting.

**Parameters:**
- `cents: AmountCents` - Amount in cents (integer, can be negative)
- `currencySymbol?: string` - Currency symbol to use (default: '$')
- `locale?: string` - Locale for number formatting (default: 'en-US')

**Returns:** `string` - Formatted currency string

**Example:**
```typescript
formatCentsWithCurrency(12345); // returns '$123.45'
formatCentsWithCurrency(12345, '€', 'de-DE'); // returns '€123,45'
formatCentsWithCurrency(1000000, '¥', 'ja-JP'); // returns '¥10,000.00'
```

### formatPercentWithSymbol(percent)
Format percentage with % symbol at the end.

**Parameters:**
- `percent: number` - Percentage value (any numeric range)

**Returns:** `string` - Formatted percentage string with % symbol

**Example:**
```typescript
formatPercentWithSymbol(13.456); // returns '13.46%'
formatPercentWithSymbol(0.13); // returns '0.13%'
formatPercentWithSymbol(100); // returns '100.00%'
```

### clampPercent01(percent)
Clamp percentage value to 0-1 range.

**Parameters:**
- `percent: number` - Percentage value to clamp (can be negative)

**Returns:** `number` - Percentage clamped between 0 and 1

**Example:**
```typescript
clampPercent01(0.5); // returns 0.5
clampPercent01(-0.1); // returns 0
clampPercent01(1.5); // returns 1
```

### clampPercent0100(percent)
Clamp percentage value to 0-100 range.

**Parameters:**
- `percent: number` - Percentage value to clamp (can be negative)

**Returns:** `number` - Percentage clamped between 0 and 100

**Example:**
```typescript
clampPercent0100(50); // returns 50
clampPercent0100(-10); // returns 0
clampPercent0100(150); // returns 100
```