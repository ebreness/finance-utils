# Finance Calculations Library

A precision-focused TypeScript utility library for financial calculations and formatting. This library works with integer cents and basis points internally to avoid floating-point precision issues, ensuring exact calculations for monetary amounts and tax computations.

## Features

- **Precision-focused**: Works with integer cents internally to avoid floating-point errors
- **String input support**: Accept both string and number inputs with automatic conversion and validation
- **Tax calculations**: Calculate tax amounts and base amounts with exact precision
- **Currency formatting**: Format monetary amounts with locale-specific formatting
- **Safe arithmetic**: Overflow-protected arithmetic operations for monetary amounts
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **JSR compatible**: Published to JSR (JavaScript Registry) for modern JavaScript runtimes

## Installation

### From JSR

```bash
# Deno
deno add @ebreness/finance-utils

# Node.js with JSR
npx jsr add @ebreness/finance-utils

# Bun
bunx jsr add @ebreness/finance-utils
```

### Import

```typescript
import {
  calculateTaxFromBase,
  calculateBaseFromTotal,
  calculateTaxBreakdown,
  formatCentsWithCurrency,
  decimalToCents,
  percent100ToBasisPoints,
  convertToAmountCents,
  convertToBasisPoints,
  convertToNumber
} from '@ebreness/finance-utils';
```

## Quick Start

```typescript
// Convert $1000.00 to cents and calculate 13% tax
const baseAmount = decimalToCents(1000.00); // 100000 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points

// Calculate tax amount
const taxAmount = calculateTaxFromBase(baseAmount, taxRate); // 13000 cents

// Format for display
console.log(`Base: ${formatCentsWithCurrency(baseAmount)}`); // "Base: $1,000.00"
console.log(`Tax: ${formatCentsWithCurrency(taxAmount)}`); // "Tax: $130.00"
console.log(`Total: ${formatCentsWithCurrency(baseAmount + taxAmount)}`); // "Total: $1,130.00"

// String input support - accept user input as strings
const userInputAmount = "32000.00"; // From form input
const userInputTaxRate = "13"; // From form input

const totalCents = convertToAmountCents(userInputAmount); // Converts string to validated cents
const taxBasisPoints = convertToBasisPoints(userInputTaxRate); // Converts string to validated basis points

// Calculate breakdown with string inputs
const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);

console.log(`Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`); // "Total: $32,000.00"
console.log(`Base: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`); // "Base: $28,318.58"
console.log(`Tax: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`); // "Tax: $3,681.42"
```

## Core Concepts

### Working with Cents

The library represents all monetary amounts as integers in cents to avoid floating-point precision issues:

```typescript
// $123.45 is represented as 12345 cents
const amount = decimalToCents(123.45); // 12345
const display = centsToDecimal(12345); // 123.45
```

### Working with Basis Points

Tax rates and percentages are represented in basis points (1 basis point = 0.01%):

```typescript
// 13% is represented as 1300 basis points
const taxRate = percent100ToBasisPoints(13); // 1300
const percentage = basisPointsToPercent100(1300); // 13
```

### String Input Support

The library accepts both string and number inputs, making it easy to work with user input from forms:

```typescript
import { convertToAmountCents, convertToBasisPoints, convertToNumber } from '@ebreness/finance-utils';

// Convert string inputs with automatic validation
const amountCents = convertToAmountCents("1000.00"); // 100000 cents
const taxRate = convertToBasisPoints("1300"); // 1300 basis points
const percentage = convertToNumber("13.5", "Tax Rate"); // 13.5

// Handles whitespace automatically
const trimmedAmount = convertToAmountCents("  1000  "); // 100000 cents

// Provides descriptive error messages
try {
  convertToAmountCents("invalid");
} catch (error) {
  console.log(error.message); // 'Amount "invalid" is not a valid number'
}
```

### Exact Precision Guarantee

**THE CORE PROMISE: base + tax = total EXACTLY, ALWAYS**

The library's most important feature is its absolute guarantee that base amount + tax amount = total amount exactly, with no rounding errors:

```typescript
const total = decimalToCents(32000.00);
const taxRate = percent100ToBasisPoints(13);
const breakdown = calculateTaxBreakdown(total, taxRate);

// GUARANTEED: This will ALWAYS be true, regardless of input values
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true

// Real numbers from the calculation:
console.log(breakdown.baseAmountCents); // 2831858
console.log(breakdown.taxAmountCents);  // 368142
console.log(breakdown.totalAmountCents); // 3200000
console.log(2831858 + 368142 === 3200000); // true - exact precision!
```

**How We Achieve This:**
1. All calculations use integer arithmetic (cents and basis points)
2. Tax amounts are calculated as the difference: `tax = total - base`
3. When mathematical precision conflicts with exact totals, we prioritize exact totals
4. No intermediate rounding that could introduce errors

**Edge Cases - Precision Still Maintained:**

```typescript
// Even with unusual values that cause floating-point issues:
const edgeCase1 = calculateTaxBreakdown(1, 3333); // $0.01 total, 33.33% tax
console.log(edgeCase1.baseAmountCents + edgeCase1.taxAmountCents === 1); // true

const edgeCase2 = calculateTaxBreakdown(999999999, 1300); // Large amount
console.log(edgeCase2.baseAmountCents + edgeCase2.taxAmountCents === 999999999); // true

// Works with string inputs too:
const stringCase = calculateTaxBreakdown("3200000", "1300");
console.log(stringCase.baseAmountCents + stringCase.taxAmountCents === 3200000); // true
```

## Edge Case Handling

The library handles challenging edge cases while maintaining exact precision:

### Very Small Amounts
```typescript
// $0.01 with 33.33% tax - would cause floating-point issues
const tiny = calculateTaxBreakdown(1, 3333);
console.log(tiny.baseAmountCents + tiny.taxAmountCents === 1); // true
console.log(formatCentsWithCurrency(tiny.baseAmountCents)); // "$0.01" (rounded for display)
console.log(formatCentsWithCurrency(tiny.taxAmountCents));  // "$0.00" (rounded for display)
console.log(formatCentsWithCurrency(tiny.totalAmountCents)); // "$0.01"
```

### High Tax Rates
```typescript
// 50% tax rate - exactly half
const highTax = calculateTaxBreakdown(300, 5000); // $3.00 with 50% tax
console.log(highTax.baseAmountCents + highTax.taxAmountCents === 300); // true
console.log(highTax.baseAmountCents); // 200 ($2.00)
console.log(highTax.taxAmountCents);  // 100 ($1.00)
```

### Large Amounts
```typescript
// Large amounts that might cause precision issues in floating-point
const large = calculateTaxBreakdown(999999999, 1300); // $9,999,999.99 with 13% tax
console.log(large.baseAmountCents + large.taxAmountCents === 999999999); // true
```

### Zero Tax Rate
```typescript
// Zero tax - base should equal total
const noTax = calculateTaxBreakdown(100000, 0); // $1,000.00 with 0% tax
console.log(noTax.baseAmountCents === 100000); // true
console.log(noTax.taxAmountCents === 0); // true
console.log(noTax.baseAmountCents + noTax.taxAmountCents === 100000); // true
```

## Documentation

- **[API Reference](docs/api-reference.md)** - Complete documentation of all functions, types, and interfaces
- **[Examples](docs/examples.md)** - Practical examples and real-world usage scenarios
- **[Deno Commands](docs/deno-commands.md)** - Development, testing, and deployment commands for Deno

## Key Functions

### Tax Calculations

- `calculateTaxFromBase(baseCents, taxBasisPoints)` - Calculate tax amount from base amount
- `calculateBaseFromTotal(totalCents, taxBasisPoints)` - Calculate base amount from total including tax
- `calculateTaxBreakdown(totalCents, taxBasisPoints)` - Get complete tax breakdown

### Conversions

- `decimalToCents(amount)` / `centsToDecimal(cents)` - Convert between decimal amounts and cents
- `percent100ToBasisPoints(percent)` / `basisPointsToPercent100(basisPoints)` - Convert between percentages and basis points

### String Input Conversion

- `convertToNumber(value, fieldName)` - Convert string or number to validated number with descriptive errors
- `convertToAmountCents(value)` - Convert string or number to validated AmountCents
- `convertToBasisPoints(value)` - Convert string or number to validated BasisPoints

### Formatting

- `formatCentsWithCurrency(cents, symbol?, locale?)` - Format cents as currency string
- `formatPercentWithSymbol(percent)` - Format percentage with % symbol

### Safe Arithmetic

- `safeAdd(a, b)` - Safely add two amounts with overflow protection
- `safeSubtract(a, b)` - Safely subtract amounts with underflow protection
- `safeMultiply(amount, factor)` - Safely multiply amount by factor with rounding

## Why This Library?

Traditional floating-point arithmetic causes precision errors in financial calculations:

```typescript
// ❌ Floating-point precision issues
const cost = 32000;
const taxRate = 0.13;
const base = cost / (1 + taxRate); // 28318.5840707965
const roundedBase = Math.round(base * 100) / 100; // 28318.58
const recalculatedTotal = roundedBase * (1 + taxRate); // 31999.9954 ≠ 32000

// ✅ EXACT PRECISION GUARANTEE with this library
const totalCents = decimalToCents(32000);
const taxBasisPoints = percent100ToBasisPoints(13);
const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);

// GUARANTEED: base + tax = total EXACTLY (always true)
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
console.log(2831858 + 368142 === 3200000); // true - exact precision!

// Even when displayed with currency formatting:
console.log(formatCentsWithCurrency(breakdown.baseAmountCents));  // "$28,318.58"
console.log(formatCentsWithCurrency(breakdown.taxAmountCents));   // "$3,681.42"  
console.log(formatCentsWithCurrency(breakdown.totalAmountCents)); // "$32,000.00"
// $28,318.58 + $3,681.42 = $32,000.00 (exact!)
```

## Development

### Prerequisites

- [Deno](https://deno.land/) 1.40+ for development and testing
- [JSR CLI](https://jsr.io/docs/publishing-packages) for publishing

### Common Commands

```bash
# Type check
deno check mod.ts

# Run tests
deno test

# Format code
deno fmt

# Lint code
deno lint

# Run tests with coverage
deno test --coverage=coverage
deno coverage coverage
```

See [Deno Commands](docs/deno-commands.md) for a complete list of development commands.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure all tests pass and code is properly formatted before submitting a pull request.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `deno test`
5. Format code: `deno fmt`
6. Submit a pull request

## Support

For questions, issues, or feature requests, please open an issue on the repository.