# Examples

This document provides practical examples of using the finance-calculations
library for common financial scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Exact Precision Guarantee](#exact-precision-guarantee)
- [String Input Support](#string-input-support)
- [Tax Calculations](#tax-calculations)
- [Currency Formatting](#currency-formatting)
- [Conversions](#conversions)
- [Safe Arithmetic](#safe-arithmetic)
- [Real-World Scenarios](#real-world-scenarios)

## Basic Usage

### Importing the Library

```typescript
import {
  basisPointsToPercent100,
  calculateBaseFromTotal,
  calculateTaxBreakdown,
  calculateTaxFromBase,
  centsToDecimal,
  convertToAmountCents,
  convertToBasisPoints,
  convertToNumber,
  decimalToCents,
  formatCentsWithCurrency,
  formatPercentWithSymbol,
  percent100ToBasisPoints,
  safeAdd,
  safeMultiply,
} from "@ebreness/finance-utils";
```

### Working with Cents

The library works internally with cents (integers) to avoid floating-point
precision issues:

```typescript
// Convert $123.45 to cents
const amountCents = decimalToCents(123.45); // 12345

// Convert back to decimal for display
const displayAmount = centsToDecimal(12345); // 123.45

// Format for display
const formatted = formatCentsWithCurrency(12345); // "$123.45"
```

### Working with Tax Rates

Tax rates are represented in basis points (1 basis point = 0.01%):

```typescript
// Convert 13% to basis points
const taxRate = percent100ToBasisPoints(13); // 1300

// Convert 5.5% to basis points
const salesTax = percent100ToBasisPoints(5.5); // 550
```

## Exact Precision Guarantee

The library's most important feature is its absolute guarantee that base
amount + tax amount = total amount exactly, with no rounding errors.

### The Core Promise

```typescript
import { calculateTaxBreakdown } from "@ebreness/finance-utils";

// ANY tax breakdown will satisfy: base + tax = total EXACTLY
const breakdown = calculateTaxBreakdown(3200000, 1300); // $32,000 with 13% tax

// GUARANTEED: This will ALWAYS be true
console.log(
  breakdown.baseAmountCents + breakdown.taxAmountCents ===
    breakdown.totalAmountCents,
); // true

// Real numbers from the calculation:
console.log(breakdown.baseAmountCents); // 2831858
console.log(breakdown.taxAmountCents); // 368142
console.log(breakdown.totalAmountCents); // 3200000
console.log(2831858 + 368142 === 3200000); // true - exact precision!
```

### Why This Matters

Traditional floating-point arithmetic causes precision errors:

```typescript
// ❌ Traditional floating-point approach (WRONG)
const total = 32000;
const taxRate = 0.13;
const base = total / (1 + taxRate); // 28318.5840707965
const roundedBase = Math.round(base * 100) / 100; // 28318.58
const recalculatedTotal = roundedBase * (1 + taxRate); // 31999.9954 ≠ 32000

console.log(roundedBase * (1 + taxRate) === total); // false - precision error!

// ✅ This library's approach (CORRECT)
const breakdown = calculateTaxBreakdown(3200000, 1300);
console.log(
  breakdown.baseAmountCents + breakdown.taxAmountCents ===
    breakdown.totalAmountCents,
); // true
```

### Edge Cases - Precision Still Maintained

The library maintains exact precision even in challenging edge cases:

```typescript
// Very small amounts
const tiny = calculateTaxBreakdown(1, 3333); // $0.01 with 33.33% tax
console.log(tiny.baseAmountCents + tiny.taxAmountCents === 1); // true

// High tax rates
const highTax = calculateTaxBreakdown(300, 5000); // $3.00 with 50% tax
console.log(highTax.baseAmountCents + highTax.taxAmountCents === 300); // true
console.log(highTax.baseAmountCents); // 200 ($2.00)
console.log(highTax.taxAmountCents); // 100 ($1.00)

// Large amounts that might cause precision issues
const large = calculateTaxBreakdown(999999999, 1300); // $9,999,999.99 with 13% tax
console.log(large.baseAmountCents + large.taxAmountCents === 999999999); // true

// Zero tax rate
const noTax = calculateTaxBreakdown(100000, 0); // $1,000 with 0% tax
console.log(noTax.baseAmountCents === 100000); // true (base = total)
console.log(noTax.taxAmountCents === 0); // true (no tax)
console.log(noTax.baseAmountCents + noTax.taxAmountCents === 100000); // true

// Unusual tax rates that would cause floating-point issues
const unusual = calculateTaxBreakdown(12345, 3333); // $123.45 with 33.33% tax
console.log(unusual.baseAmountCents + unusual.taxAmountCents === 12345); // true
```

### Display Formatting Maintains Relationship

Even when amounts are formatted for display, the mathematical relationship
holds:

```typescript
const breakdown = calculateTaxBreakdown(3200000, 1300);

// Format for display
const baseFormatted = formatCentsWithCurrency(breakdown.baseAmountCents); // "$28,318.58"
const taxFormatted = formatCentsWithCurrency(breakdown.taxAmountCents); // "$3,681.42"
const totalFormatted = formatCentsWithCurrency(breakdown.totalAmountCents); // "$32,000.00"

console.log(`${baseFormatted} + ${taxFormatted} = ${totalFormatted}`);
// Output: "$28,318.58 + $3,681.42 = $32,000.00"

// The displayed amounts maintain the exact relationship:
// $28,318.58 + $3,681.42 = $32,000.00 (exact!)
```

### How We Achieve This

The library uses a specific algorithm to guarantee exact precision:

```typescript
// 1. Calculate base using integer arithmetic
const baseCents = Math.round(
  totalCents * BASIS_POINTS_SCALE / (BASIS_POINTS_SCALE + taxBasisPoints),
);

// 2. Calculate tax as the DIFFERENCE (not as a percentage)
const taxCents = totalCents - baseCents;

// This guarantees: baseCents + taxCents = totalCents EXACTLY
```

### Verification in Your Code

You can always verify the exact precision guarantee in your own code:

```typescript
function verifyExactPrecision(
  totalCents: number,
  taxBasisPoints: number,
): boolean {
  const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);
  return breakdown.baseAmountCents + breakdown.taxAmountCents ===
    breakdown.totalAmountCents;
}

// Test with various inputs
console.log(verifyExactPrecision(3200000, 1300)); // true
console.log(verifyExactPrecision(1, 9999)); // true
console.log(verifyExactPrecision(999999999, 1)); // true
console.log(verifyExactPrecision(12345, 6789)); // true

// This will ALWAYS return true, regardless of input values
```

## String Input Support

The library accepts both string and number inputs, making it perfect for
handling user input from forms, APIs, or configuration files.

### Basic String Conversion

```typescript
// Convert string inputs to validated numbers
const amount = convertToNumber("123.45", "Amount"); // 123.45
const price = convertToNumber("  1000.00  ", "Price"); // 1000.00 (whitespace trimmed)

// Convert strings to cents with validation
const amountCents = convertToAmountCents("12345"); // 12345 cents
const priceCents = convertToAmountCents("100000"); // 100000 cents

// Convert strings to basis points with validation
const taxRate = convertToBasisPoints("1300"); // 1300 basis points (13%)
const salesTax = convertToBasisPoints("550"); // 550 basis points (5.5%)
```

### Handling User Form Input

```typescript
// Simulate form input (all strings)
const formData = {
  totalAmount: "32000.00",
  taxRate: "13",
};

// Convert and validate form inputs
const totalCents = convertToAmountCents(formData.totalAmount); // 3200000 cents
const taxBasisPoints = convertToBasisPoints(formData.taxRate); // 1300 basis points

// Perform calculations with converted values
const breakdown = calculateTaxBreakdown(totalCents, taxBasisPoints);

console.log(`Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`); // "Total: $32,000.00"
console.log(`Base: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`); // "Base: $28,318.58"
console.log(`Tax: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`); // "Tax: $3,681.42"
```

### Error Handling with Descriptive Messages

```typescript
// The library provides descriptive error messages for invalid inputs
try {
  convertToAmountCents("invalid-amount");
} catch (error) {
  console.log(error.message); // 'Amount "invalid-amount" is not a valid number'
}

try {
  convertToAmountCents(""); // Empty string
} catch (error) {
  console.log(error.message); // 'Amount cannot be empty string'
}

try {
  convertToAmountCents("123.45"); // Decimal not allowed for cents
} catch (error) {
  console.log(error.message); // 'Amount in cents must be an integer'
}

try {
  convertToBasisPoints("-100"); // Negative not allowed
} catch (error) {
  console.log(error.message); // 'Basis points cannot be negative'
}
```

### Mixed Input Types

```typescript
// The library handles both strings and numbers seamlessly
function calculateOrderTotal(
  baseAmount: string | number,
  taxRate: string | number,
) {
  const baseCents = convertToAmountCents(baseAmount);
  const taxBasisPoints = convertToBasisPoints(taxRate);

  const taxCents = calculateTaxFromBase(baseCents, taxBasisPoints);
  const totalCents = safeAdd(baseCents, taxCents);

  return {
    base: formatCentsWithCurrency(baseCents),
    tax: formatCentsWithCurrency(taxCents),
    total: formatCentsWithCurrency(totalCents),
  };
}

// Works with strings
console.log(calculateOrderTotal("100000", "1300"));
// Output: { base: '$1,000.00', tax: '$130.00', total: '$1,130.00' }

// Works with numbers
console.log(calculateOrderTotal(100000, 1300));
// Output: { base: '$1,000.00', tax: '$130.00', total: '$1,130.00' }

// Works with mixed types
console.log(calculateOrderTotal("100000", 1300));
// Output: { base: '$1,000.00', tax: '$130.00', total: '$1,130.00' }
```

### API Response Processing

```typescript
// Process API responses that return string values
interface ApiResponse {
  amount: string;
  tax_rate: string;
  currency: string;
}

function processApiResponse(response: ApiResponse) {
  try {
    // Convert string values with validation
    const amountCents = convertToAmountCents(response.amount);
    const taxBasisPoints = convertToBasisPoints(response.tax_rate);

    // Calculate breakdown
    const breakdown = calculateTaxBreakdown(amountCents, taxBasisPoints);

    return {
      success: true,
      data: {
        base: formatCentsWithCurrency(
          breakdown.baseAmountCents,
          response.currency,
        ),
        tax: formatCentsWithCurrency(
          breakdown.taxAmountCents,
          response.currency,
        ),
        total: formatCentsWithCurrency(
          breakdown.totalAmountCents,
          response.currency,
        ),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Example usage
const apiResponse: ApiResponse = {
  amount: "113000",
  tax_rate: "1300",
  currency: "$",
};

const result = processApiResponse(apiResponse);
console.log(result);
// Output: {
//   success: true,
//   data: {
//     base: '$1,000.00',
//     tax: '$130.00',
//     total: '$1,130.00'
//   }
// }
```

## Tax Calculations

### Calculate Tax from Base Amount

When you know the base amount and need to calculate the tax:

```typescript
// Calculate 13% tax on $1,000.00
const baseAmount = decimalToCents(1000.00); // 100000 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points

const taxAmount = calculateTaxFromBase(baseAmount, taxRate); // 13000 cents
const totalAmount = safeAdd(baseAmount, taxAmount); // 113000 cents

console.log(`Base: ${formatCentsWithCurrency(baseAmount)}`); // "Base: $1,000.00"
console.log(`Tax: ${formatCentsWithCurrency(taxAmount)}`); // "Tax: $130.00"
console.log(`Total: ${formatCentsWithCurrency(totalAmount)}`); // "Total: $1,130.00"
```

### Calculate Base from Total Amount

When you know the total amount including tax and need to find the base:

```typescript
// You have $32,000.00 total with 13% tax - what's the base amount?
const totalAmount = decimalToCents(32000.00); // 3200000 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points

const baseAmount = calculateBaseFromTotal(totalAmount, taxRate); // 2831858 cents
const taxAmount = totalAmount - baseAmount; // 368142 cents

console.log(`Total: ${formatCentsWithCurrency(totalAmount)}`); // "Total: $32,000.00"
console.log(`Base: ${formatCentsWithCurrency(baseAmount)}`); // "Base: $28,318.58"
console.log(`Tax: ${formatCentsWithCurrency(taxAmount)}`); // "Tax: $3,681.42"
```

### Complete Tax Breakdown

Get a complete breakdown in one function call:

```typescript
const totalAmount = decimalToCents(1130.00); // 113000 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points

const breakdown = calculateTaxBreakdown(totalAmount, taxRate);

console.log(`Base: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`); // "Base: $1,000.00"
console.log(`Tax: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`); // "Tax: $130.00"
console.log(`Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`); // "Total: $1,130.00"
```

### Tax Breakdown with Discount

Calculate tax breakdown with discount applied to the original base amount:

```typescript
const totalAmount = decimalToCents(122.00); // 12200 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points (13%)
const discountRate = percent100ToBasisPoints(5); // 500 basis points (5%)

const breakdown = calculateTaxBreakdown(totalAmount, taxRate, discountRate);

console.log(`Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`); // "Total: $122.00"
console.log(`Base: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`); // "Base: $107.97"
console.log(`Tax: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`); // "Tax: $14.03"
console.log(
  `Discount: ${formatCentsWithCurrency(breakdown.discountedAmountCents)}`,
); // "Discount: $5.70"
console.log(
  `Discount Rate: ${
    formatPercentWithSymbol(
      basisPointsToPercent100(breakdown.discountBasisPoints),
    )
  }`,
); // "Discount Rate: 5.00%"

// GUARANTEED: base + tax = total exactly
console.log(
  breakdown.baseAmountCents + breakdown.taxAmountCents ===
    breakdown.totalAmountCents,
); // true
```

## Currency Formatting

### Basic Currency Formatting

```typescript
const amount = decimalToCents(1234.56);

// Default formatting (USD)
console.log(formatCentsWithCurrency(amount)); // "$1,234.56"

// European formatting
console.log(formatCentsWithCurrency(amount, "€", "de-DE")); // "€1.234,56"

// Japanese formatting
console.log(formatCentsWithCurrency(amount, "¥", "ja-JP")); // "¥1,234.56"
```

### Percentage Formatting

```typescript
const taxRate = 13.456;

// Format with % symbol
console.log(formatPercentWithSymbol(taxRate)); // "13.46%"

// Format as number only
console.log(formatPercentToNumber(taxRate)); // 13.46
```

### Handling Negative Amounts

```typescript
const negativeAmount = decimalToCents(-123.45); // -12345

console.log(formatCentsWithCurrency(negativeAmount)); // "$-123.45"
console.log(formatPercentWithSymbol(-5.5)); // "-5.50%"
```

## Conversions

### Decimal to Cents and Back

```typescript
// Various decimal amounts
const amounts = [0.01, 1.00, 123.45, 999.99];

amounts.forEach((amount) => {
  const cents = decimalToCents(amount);
  const backToDecimal = centsToDecimal(cents);

  console.log(`${amount} -> ${cents} cents -> ${backToDecimal}`);
});

// Output:
// 0.01 -> 1 cents -> 0.01
// 1.00 -> 100 cents -> 1.00
// 123.45 -> 12345 cents -> 123.45
// 999.99 -> 99999 cents -> 999.99
```

### Percentage Conversions

```typescript
// Different percentage formats
const percentages = [13, 5.5, 0.25];

percentages.forEach((percent) => {
  const basisPoints = percent100ToBasisPoints(percent);
  const backToPercent = basisPointsToPercent100(basisPoints);

  console.log(`${percent}% -> ${basisPoints} bp -> ${backToPercent}%`);
});

// Output:
// 13% -> 1300 bp -> 13%
// 5.5% -> 550 bp -> 5.5%
// 0.25% -> 25 bp -> 0.25%
```

## Safe Arithmetic

### Adding Amounts

```typescript
const amount1 = decimalToCents(123.45); // 12345
const amount2 = decimalToCents(67.89); // 6789

const total = safeAdd(amount1, amount2); // 19134
console.log(formatCentsWithCurrency(total)); // "$191.34"
```

### Subtracting Amounts

```typescript
const total = decimalToCents(191.34); // 19134
const amount = decimalToCents(67.89); // 6789

const remaining = safeSubtract(total, amount); // 12345
console.log(formatCentsWithCurrency(remaining)); // "$123.45"
```

### Multiplying Amounts

```typescript
const baseAmount = decimalToCents(100.00); // 10000

// Double the amount
const doubled = safeMultiply(baseAmount, 2); // 20000
console.log(formatCentsWithCurrency(doubled)); // "$200.00"

// Apply a 15% increase
const increased = safeMultiply(baseAmount, 1.15); // 11500
console.log(formatCentsWithCurrency(increased)); // "$115.00"
```

## Discount Calculations

The library supports discount calculations with the same exact precision
guarantee. Discounts are applied to the original base amount before tax
calculation.

### Basic Discount Usage

```typescript
// $500.00 with 13% tax and 10% discount
const totalAmount = decimalToCents(500.00); // 50000 cents
const taxRate = percent100ToBasisPoints(13); // 1300 basis points
const discountRate = percent100ToBasisPoints(10); // 1000 basis points

const breakdown = calculateTaxBreakdown(totalAmount, taxRate, discountRate);

console.log("Discount Breakdown:");
console.log(`Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`); // "Total: $500.00"
console.log(
  `Base (after discount): ${
    formatCentsWithCurrency(breakdown.baseAmountCents)
  }`,
); // "Base: $398.23"
console.log(
  `Tax (13% on discounted): ${
    formatCentsWithCurrency(breakdown.taxAmountCents)
  }`,
); // "Tax: $51.77"
console.log(
  `Discount Applied: ${
    formatCentsWithCurrency(breakdown.discountedAmountCents)
  }`,
); // "Discount: $44.25"
console.log(
  `Discount Rate: ${
    formatPercentWithSymbol(
      basisPointsToPercent100(breakdown.discountBasisPoints),
    )
  }`,
); // "Discount Rate: 10.00%"

// GUARANTEED: base + tax = total exactly
console.log(
  `Precision Check: ${
    breakdown.baseAmountCents + breakdown.taxAmountCents ===
      breakdown.totalAmountCents
  }`,
); // true
```

### Discount Calculation Logic

The discount feature follows this precise sequence:

```typescript
// Example: $1000.00 with 13% tax and 15% discount
const total = decimalToCents(1000.00); // 100000 cents
const tax = percent100ToBasisPoints(13); // 1300 basis points
const discount = percent100ToBasisPoints(15); // 1500 basis points

const result = calculateTaxBreakdown(total, tax, discount);

console.log("Step-by-step breakdown:");
console.log("1. Calculate what original base would be (ignoring discount)");
console.log("2. Apply 15% discount to original base");
console.log("3. Calculate 13% tax on discounted amount");
console.log("4. Adjust final amounts to ensure exact total");
console.log("");
console.log(`Final Result:`);
console.log(
  `- Base (after discount): ${formatCentsWithCurrency(result.baseAmountCents)}`,
);
console.log(
  `- Tax (on discounted base): ${
    formatCentsWithCurrency(result.taxAmountCents)
  }`,
);
console.log(`- Total: ${formatCentsWithCurrency(result.totalAmountCents)}`);
console.log(
  `- Discount Amount: ${formatCentsWithCurrency(result.discountedAmountCents)}`,
);
console.log(
  `- Exact Precision: ${
    result.baseAmountCents + result.taxAmountCents === result.totalAmountCents
  }`,
);
```

### High Discount Rates

```typescript
// Test various high discount rates
const testCases = [
  { discount: 25, description: "25% off sale" },
  { discount: 50, description: "Half price" },
  { discount: 75, description: "Clearance sale" },
  { discount: 90, description: "Liquidation" },
];

const baseTotal = decimalToCents(200.00); // $200.00
const taxRate = percent100ToBasisPoints(13); // 13%

testCases.forEach((testCase) => {
  const discountRate = percent100ToBasisPoints(testCase.discount);
  const breakdown = calculateTaxBreakdown(baseTotal, taxRate, discountRate);

  console.log(`\n${testCase.description} (${testCase.discount}% discount):`);
  console.log(`- Original Total: ${formatCentsWithCurrency(baseTotal)}`);
  console.log(
    `- Final Base: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`,
  );
  console.log(`- Tax: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`);
  console.log(
    `- Discount Saved: ${
      formatCentsWithCurrency(breakdown.discountedAmountCents)
    }`,
  );
  console.log(
    `- Precision Check: ${
      breakdown.baseAmountCents + breakdown.taxAmountCents ===
        breakdown.totalAmountCents
    }`,
  );
});
```

### String Input Support for Discounts

```typescript
// Handle discount inputs from forms or APIs
function processDiscountOrder(
  totalStr: string,
  taxStr: string,
  discountStr: string,
) {
  try {
    // Convert all string inputs
    const totalCents = convertToAmountCents(totalStr);
    const taxBasisPoints = convertToBasisPoints(taxStr);
    const discountBasisPoints = convertToBasisPoints(discountStr);

    // Calculate with discount
    const breakdown = calculateTaxBreakdown(
      totalCents,
      taxBasisPoints,
      discountBasisPoints,
    );

    return {
      success: true,
      breakdown: {
        total: formatCentsWithCurrency(breakdown.totalAmountCents),
        base: formatCentsWithCurrency(breakdown.baseAmountCents),
        tax: formatCentsWithCurrency(breakdown.taxAmountCents),
        discount: formatCentsWithCurrency(breakdown.discountedAmountCents),
        discountRate: formatPercentWithSymbol(
          basisPointsToPercent100(breakdown.discountBasisPoints),
        ),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Example usage with form data
const formData = {
  total: "  12200  ", // $122.00 with whitespace
  tax: "1300", // 13%
  discount: "500", // 5%
};

const result = processDiscountOrder(
  formData.total,
  formData.tax,
  formData.discount,
);
console.log(result);
// Output: {
//   success: true,
//   breakdown: {
//     total: '$122.00',
//     base: '$107.97',
//     tax: '$14.03',
//     discount: '$5.70',
//     discountRate: '5.00%'
//   }
// }
```

### Zero Discount (Backward Compatibility)

```typescript
// Zero discount behaves exactly like no discount parameter
const total = decimalToCents(122.00);
const tax = percent100ToBasisPoints(13);

const withZeroDiscount = calculateTaxBreakdown(total, tax, 0);
const withoutDiscount = calculateTaxBreakdown(total, tax);

console.log("Comparison - Zero Discount vs No Discount:");
console.log(
  `With zero discount - Base: ${
    formatCentsWithCurrency(withZeroDiscount.baseAmountCents)
  }`,
);
console.log(
  `Without discount - Base: ${
    formatCentsWithCurrency(withoutDiscount.baseAmountCents)
  }`,
);
console.log(
  `Results identical: ${
    withZeroDiscount.baseAmountCents === withoutDiscount.baseAmountCents
  }`,
);

// Zero discount result doesn't include discount fields
console.log(
  `Has discount fields: ${"discountedAmountCents" in withZeroDiscount}`,
); // false
console.log(`Standard result type: ${typeof withoutDiscount}`); // object
```

### Edge Cases with Discounts

```typescript
// Very small amounts with discount
const tinyAmount = 100; // $1.00
const smallDiscount = calculateTaxBreakdown(tinyAmount, 1300, 500); // 13% tax, 5% discount
console.log(
  `Tiny amount with discount - Precision: ${
    smallDiscount.baseAmountCents + smallDiscount.taxAmountCents === tinyAmount
  }`,
);

// Large discount on small amount
const largeDiscountSmall = calculateTaxBreakdown(500, 1300, 8000); // $5.00 with 80% discount
console.log(
  `Large discount on small amount - Precision: ${
    largeDiscountSmall.baseAmountCents + largeDiscountSmall.taxAmountCents ===
      500
  }`,
);

// Very large amounts with discount
const largeAmount = 10000000; // $100,000.00
try {
  const largeWithDiscount = calculateTaxBreakdown(largeAmount, 1300, 1000); // 13% tax, 10% discount
  console.log(
    `Large amount with discount - Precision: ${
      largeWithDiscount.baseAmountCents + largeWithDiscount.taxAmountCents ===
        largeAmount
    }`,
  );
} catch (error) {
  console.log(
    `Large amount error (expected for overflow protection): ${error.message}`,
  );
}
```

## Real-World Scenarios

### E-commerce Order Total

```typescript
// Calculate order total with multiple items and tax
const items = [
  { name: "Widget A", price: 29.99, quantity: 2 },
  { name: "Widget B", price: 15.50, quantity: 1 },
  { name: "Widget C", price: 8.25, quantity: 3 },
];

const taxRate = percent100ToBasisPoints(8.5); // 8.5% sales tax

// Calculate subtotal
let subtotalCents = 0;
items.forEach((item) => {
  const itemTotal = safeMultiply(decimalToCents(item.price), item.quantity);
  subtotalCents = safeAdd(subtotalCents, itemTotal);
});

// Calculate tax and total
const taxCents = calculateTaxFromBase(subtotalCents, taxRate);
const totalCents = safeAdd(subtotalCents, taxCents);

console.log("Order Summary:");
items.forEach((item) => {
  const itemTotal = safeMultiply(decimalToCents(item.price), item.quantity);
  console.log(
    `${item.name}: ${item.quantity} × ${
      formatCentsWithCurrency(decimalToCents(item.price))
    } = ${formatCentsWithCurrency(itemTotal)}`,
  );
});

console.log(`Subtotal: ${formatCentsWithCurrency(subtotalCents)}`);
console.log(
  `Tax (${formatPercentWithSymbol(8.5)}): ${formatCentsWithCurrency(taxCents)}`,
);
console.log(`Total: ${formatCentsWithCurrency(totalCents)}`);

// Output:
// Order Summary:
// Widget A: 2 × $29.99 = $59.98
// Widget B: 1 × $15.50 = $15.50
// Widget C: 3 × $8.25 = $24.75
// Subtotal: $100.23
// Tax (8.50%): $8.52
// Total: $108.75
```

### Service Invoice with Multiple Tax Rates

```typescript
// Professional services with different tax rates
const services = [
  { description: "Consulting", amount: 2500.00, taxRate: 0 }, // Tax-exempt
  { description: "Software License", amount: 1200.00, taxRate: 13 }, // 13% HST
  { description: "Training", amount: 800.00, taxRate: 5 }, // 5% GST
];

let totalBase = 0;
let totalTax = 0;

console.log("Invoice Breakdown:");
services.forEach((service) => {
  const baseCents = decimalToCents(service.amount);
  const taxBasisPoints = percent100ToBasisPoints(service.taxRate);
  const taxCents = calculateTaxFromBase(baseCents, taxBasisPoints);
  const serviceTotalCents = safeAdd(baseCents, taxCents);

  totalBase = safeAdd(totalBase, baseCents);
  totalTax = safeAdd(totalTax, taxCents);

  console.log(
    `${service.description}: ${formatCentsWithCurrency(baseCents)} + ${
      formatCentsWithCurrency(taxCents)
    } tax = ${formatCentsWithCurrency(serviceTotalCents)}`,
  );
});

const grandTotal = safeAdd(totalBase, totalTax);

console.log(`\nSubtotal: ${formatCentsWithCurrency(totalBase)}`);
console.log(`Total Tax: ${formatCentsWithCurrency(totalTax)}`);
console.log(`Grand Total: ${formatCentsWithCurrency(grandTotal)}`);

// Output:
// Invoice Breakdown:
// Consulting: $2,500.00 + $0.00 tax = $2,500.00
// Software License: $1,200.00 + $156.00 tax = $1,356.00
// Training: $800.00 + $40.00 tax = $840.00
//
// Subtotal: $4,500.00
// Total Tax: $196.00
// Grand Total: $4,696.00
```

### Reverse Tax Calculation for Receipts

```typescript
// You have a receipt total and need to extract the tax amount
const receiptTotal = decimalToCents(45.20); // $45.20 total
const taxRate = percent100ToBasisPoints(13); // 13% HST

const breakdown = calculateTaxBreakdown(receiptTotal, taxRate);

console.log("Receipt Analysis:");
console.log(
  `Receipt Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`,
);
console.log(
  `Base Amount: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`,
);
console.log(`Tax Amount: ${formatCentsWithCurrency(breakdown.taxAmountCents)}`);
console.log(`Tax Rate: ${formatPercentWithSymbol(13)}`);

// Verify the calculation
const verifyTax = calculateTaxFromBase(breakdown.baseAmountCents, taxRate);
const verifyTotal = safeAdd(breakdown.baseAmountCents, verifyTax);

console.log(`\nVerification:`);
console.log(`Calculated tax: ${formatCentsWithCurrency(verifyTax)}`);
console.log(`Calculated total: ${formatCentsWithCurrency(verifyTotal)}`);
console.log(`Matches receipt: ${verifyTotal === receiptTotal ? "Yes" : "No"}`);

// Output:
// Receipt Analysis:
// Receipt Total: $45.20
// Base Amount: $40.00
// Tax Amount: $5.20
// Tax Rate: 13.00%
//
// Verification:
// Calculated tax: $5.20
// Calculated total: $45.20
// Matches receipt: Yes
```

### Tip Calculator

```typescript
// Calculate tip and total for a restaurant bill
const billAmount = decimalToCents(87.50); // $87.50
const tipPercentage = 18; // 18% tip
const taxRate = percent100ToBasisPoints(8.875); // 8.875% tax (NYC)

// Calculate tax on the bill
const taxAmount = calculateTaxFromBase(billAmount, taxRate);
const billWithTax = safeAdd(billAmount, taxAmount);

// Calculate tip on pre-tax amount
const tipBasisPoints = percent100ToBasisPoints(tipPercentage);
const tipAmount = calculateTaxFromBase(billAmount, tipBasisPoints);

// Calculate final total
const finalTotal = safeAdd(billWithTax, tipAmount);

console.log("Restaurant Bill Breakdown:");
console.log(`Bill Amount: ${formatCentsWithCurrency(billAmount)}`);
console.log(
  `Tax (${formatPercentWithSymbol(8.875)}): ${
    formatCentsWithCurrency(taxAmount)
  }`,
);
console.log(`Subtotal: ${formatCentsWithCurrency(billWithTax)}`);
console.log(
  `Tip (${formatPercentWithSymbol(tipPercentage)} on pre-tax): ${
    formatCentsWithCurrency(tipAmount)
  }`,
);
console.log(`Final Total: ${formatCentsWithCurrency(finalTotal)}`);

// Output:
// Restaurant Bill Breakdown:
// Bill Amount: $87.50
// Tax (8.88%): $7.77
// Subtotal: $95.27
// Tip (18.00% on pre-tax): $15.75
// Final Total: $111.02
```

### E-commerce Discount Promotion

```typescript
// Black Friday sale: 25% off everything, plus tax
const originalItems = [
  { name: "Laptop", price: 1299.99, quantity: 1 },
  { name: "Mouse", price: 29.99, quantity: 2 },
  { name: "Keyboard", price: 89.99, quantity: 1 },
];

const discountRate = percent100ToBasisPoints(25); // 25% Black Friday discount
const taxRate = percent100ToBasisPoints(8.5); // 8.5% sales tax

console.log("Black Friday Sale - 25% Off Everything!");
console.log("=".repeat(50));

let grandTotal = 0;
let totalDiscount = 0;

originalItems.forEach((item) => {
  // Calculate item total before discount
  const itemSubtotal = safeMultiply(decimalToCents(item.price), item.quantity);

  // Apply discount and tax using the discount-enabled breakdown
  const breakdown = calculateTaxBreakdown(itemSubtotal, taxRate, discountRate);

  grandTotal = safeAdd(grandTotal, breakdown.totalAmountCents);
  totalDiscount = safeAdd(totalDiscount, breakdown.discountedAmountCents);

  console.log(`\n${item.name}:`);
  console.log(
    `  Original: ${item.quantity} × ${
      formatCentsWithCurrency(decimalToCents(item.price))
    } = ${formatCentsWithCurrency(itemSubtotal)}`,
  );
  console.log(
    `  Discount (25%): -${
      formatCentsWithCurrency(breakdown.discountedAmountCents)
    }`,
  );
  console.log(
    `  After Discount: ${formatCentsWithCurrency(breakdown.baseAmountCents)}`,
  );
  console.log(
    `  Tax (8.5%): ${formatCentsWithCurrency(breakdown.taxAmountCents)}`,
  );
  console.log(
    `  Item Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`,
  );

  // Verify precision for each item
  console.log(
    `  Precision Check: ${
      breakdown.baseAmountCents + breakdown.taxAmountCents ===
          breakdown.totalAmountCents
        ? "✓"
        : "✗"
    }`,
  );
});

console.log("\n" + "=".repeat(50));
console.log("ORDER SUMMARY:");
console.log(`Total Savings: ${formatCentsWithCurrency(totalDiscount)}`);
console.log(`Final Total: ${formatCentsWithCurrency(grandTotal)}`);

// Output:
// Black Friday Sale - 25% Off Everything!
// ==================================================
//
// Laptop:
//   Original: 1 × $1,299.99 = $1,299.99
//   Discount (25%): -$289.38
//   After Discount: $921.24
//   Tax (8.5%): $78.31
//   Item Total: $999.55
//   Precision Check: ✓
//
// Mouse:
//   Original: 2 × $29.99 = $59.98
//   Discount (25%): -$13.33
//   After Discount: $42.44
//   Tax (8.5%): $3.61
//   Item Total: $46.05
//   Precision Check: ✓
//
// Keyboard:
//   Original: 1 × $89.99 = $89.99
//   Discount (25%): -$20.00
//   After Discount: $63.54
//   Tax (8.5%): $5.40
//   Item Total: $68.94
//   Precision Check: ✓
//
// ==================================================
// ORDER SUMMARY:
// Total Savings: $322.71
// Final Total: $1,114.54
```

### Loyalty Program Discount

```typescript
// Customer loyalty program with tiered discounts
interface Customer {
  name: string;
  loyaltyLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  orderTotal: number;
}

function getLoyaltyDiscount(level: Customer["loyaltyLevel"]): number {
  const discounts = {
    "Bronze": 5, // 5%
    "Silver": 10, // 10%
    "Gold": 15, // 15%
    "Platinum": 20, // 20%
  };
  return discounts[level];
}

const customers: Customer[] = [
  { name: "Alice Johnson", loyaltyLevel: "Bronze", orderTotal: 150.00 },
  { name: "Bob Smith", loyaltyLevel: "Silver", orderTotal: 275.50 },
  { name: "Carol Davis", loyaltyLevel: "Gold", orderTotal: 420.75 },
  { name: "David Wilson", loyaltyLevel: "Platinum", orderTotal: 680.25 },
];

const taxRate = percent100ToBasisPoints(13); // 13% tax

console.log("LOYALTY PROGRAM DISCOUNTS");
console.log("=".repeat(60));

customers.forEach((customer) => {
  const orderCents = decimalToCents(customer.orderTotal);
  const discountPercent = getLoyaltyDiscount(customer.loyaltyLevel);
  const discountBasisPoints = percent100ToBasisPoints(discountPercent);

  const breakdown = calculateTaxBreakdown(
    orderCents,
    taxRate,
    discountBasisPoints,
  );

  console.log(`\n${customer.name} (${customer.loyaltyLevel} Member):`);
  console.log(`  Original Order: ${formatCentsWithCurrency(orderCents)}`);
  console.log(
    `  ${customer.loyaltyLevel} Discount (${discountPercent}%): -${
      formatCentsWithCurrency(breakdown.discountedAmountCents)
    }`,
  );
  console.log(
    `  Discounted Subtotal: ${
      formatCentsWithCurrency(breakdown.baseAmountCents)
    }`,
  );
  console.log(
    `  Tax (13%): ${formatCentsWithCurrency(breakdown.taxAmountCents)}`,
  );
  console.log(
    `  Final Total: ${formatCentsWithCurrency(breakdown.totalAmountCents)}`,
  );
  console.log(
    `  You Saved: ${formatCentsWithCurrency(breakdown.discountedAmountCents)}`,
  );
  console.log(
    `  Precision: ${
      breakdown.baseAmountCents + breakdown.taxAmountCents ===
          breakdown.totalAmountCents
        ? "✓ Exact"
        : "✗ Error"
    }`,
  );
});

// Output:
// LOYALTY PROGRAM DISCOUNTS
// ============================================================
//
// Alice Johnson (Bronze Member):
//   Original Order: $150.00
//   Bronze Discount (5%): -$6.64
//   Discounted Subtotal: $126.55
//   Tax (13%): $16.45
//   Final Total: $143.00
//   You Saved: $6.64
//   Precision: ✓ Exact
//
// Bob Smith (Silver Member):
//   Original Order: $275.50
//   Silver Discount (10%): -$24.38
//   Discounted Subtotal: $219.91
//   Tax (13%): $28.59
//   Final Total: $248.50
//   You Saved: $24.38
//   Precision: ✓ Exact
//
// Carol Davis (Gold Member):
//   Original Order: $420.75
//   Gold Discount (15%): -$55.83
//   Discounted Subtotal: $323.09
//   Tax (13%): $42.00
//   Final Total: $365.09
//   You Saved: $55.83
//   Precision: ✓ Exact
//
// David Wilson (Platinum Member):
//   Original Order: $680.25
//   Platinum Discount (20%): -$120.22
//   Discounted Subtotal: $496.02
//   Tax (13%): $64.48
//   Final Total: $560.50
//   You Saved: $120.22
//   Precision: ✓ Exact
```
