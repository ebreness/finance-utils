# Finance Calculations Library

A precision-focused TypeScript utility library for financial calculations and formatting. This library works with integer cents and basis points internally to avoid floating-point precision issues, ensuring exact calculations for monetary amounts and tax computations.

## Features

- **Precision-focused**: Works with integer cents internally to avoid floating-point errors
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
  percent100ToBasisPoints
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

// Reverse calculation: from total amount, find base and tax
const totalAmount = decimalToCents(32000.00); // 3200000 cents
const breakdown = calculateTaxBreakdown(totalAmount, taxRate);

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

### Exact Precision

The library ensures that base + tax = total exactly:

```typescript
const total = decimalToCents(32000.00);
const taxRate = percent100ToBasisPoints(13);
const breakdown = calculateTaxBreakdown(total, taxRate);

// This will always be true:
console.log(breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents); // true
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

// ✅ Exact precision with this library
const totalCents = decimalToCents(32000);
const taxBasisPoints = percent100ToBasisPoints(13);
const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);
// breakdown.baseAmountCents + breakdown.taxAmountCents === breakdown.totalAmountCents (always true)
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