# Design Document

## Overview

The string input support enhancement extends the existing finance calculations library to accept both string and number inputs across all calculation and conversion functions. This design maintains backward compatibility while providing a more flexible API that can handle user input from forms, APIs, and other string-based data sources.

The enhancement follows the existing architecture principles of precision-first calculations and comprehensive validation, adding a new string-to-number conversion layer that integrates seamlessly with the current validation system.

## Architecture

The enhancement adds a new conversion layer to the existing architecture:

```
mod.ts (main entry point)
├── calculations.ts (enhanced with string | number inputs)
├── conversions.ts (enhanced with string | number inputs)
├── validation.ts (enhanced with string conversion utilities)
├── types.ts (updated with StringOrNumber type)
├── formatting.ts (unchanged)
└── constants.ts (unchanged)
```

### Core Design Principles

1. **Backward Compatibility**: All existing number-based APIs continue to work unchanged
2. **Type Safety**: TypeScript types accurately reflect string | number union types
3. **Early Conversion**: Strings are converted to numbers at function entry points
4. **Consistent Validation**: String inputs undergo the same validation as number inputs after conversion
5. **Clear Error Messages**: Conversion errors reference the original string input for debugging

## Components and Interfaces

### Enhanced Type Definitions

```typescript
// New union type for flexible input
type StringOrNumber = string | number;

// Enhanced function signatures
function calculateBaseFromTotal(
  totalCents: StringOrNumber,
  taxBasisPoints: StringOrNumber
): AmountCents;

function decimalToCents(decimalAmount: StringOrNumber): AmountCents;

function percent100ToBasisPoints(percentage: StringOrNumber): BasisPoints;
```

### String Conversion Utilities

```typescript
/**
 * Converts a string or number to a validated number
 * @param value - String or number input
 * @param fieldName - Field name for error messages
 * @returns Converted and validated number
 * @throws Error if conversion fails or validation fails
 */
function convertToNumber(value: StringOrNumber, fieldName: string): number;

/**
 * Converts string or number to AmountCents with validation
 * @param value - String or number input
 * @returns Validated AmountCents
 * @throws Error if conversion or validation fails
 */
function convertToAmountCents(value: StringOrNumber): AmountCents;

/**
 * Converts string or number to BasisPoints with validation
 * @param value - String or number input
 * @returns Validated BasisPoints
 * @throws Error if conversion or validation fails
 */
function convertToBasisPoints(value: StringOrNumber): BasisPoints;
```

### Enhanced Validation Functions

The existing validation functions will be enhanced to work with the new conversion utilities:

```typescript
// Enhanced validation that accepts string | number
function validateAmountCents(value: StringOrNumber): AmountCents;
function validateBasisPoints(value: StringOrNumber): BasisPoints;
function validateNumber(value: StringOrNumber, fieldName: string): number;
```

## Data Models

### String Conversion Algorithm

The string-to-number conversion follows this process:

```typescript
function convertToNumber(value: StringOrNumber, fieldName: string): number {
  // If already a number, return as-is
  if (typeof value === 'number') {
    return value;
  }
  
  // Handle string conversion
  if (typeof value === 'string') {
    // Trim whitespace
    const trimmed = value.trim();
    
    // Check for empty string
    if (trimmed === '') {
      throw new Error(`${fieldName} cannot be empty string`);
    }
    
    // Convert to number
    const converted = Number(trimmed);
    
    // Check if conversion was successful
    if (Number.isNaN(converted)) {
      throw new Error(`${fieldName} "${value}" is not a valid number`);
    }
    
    return converted;
  }
  
  // Handle other types
  throw new Error(`${fieldName} must be a string or number, received ${typeof value}`);
}
```

### Function Enhancement Pattern

Each function will be enhanced following this pattern:

```typescript
// Before (number only)
function calculateBaseFromTotal(totalCents: AmountCents, taxBasisPoints: BasisPoints): AmountCents {
  const validTotalCents = validateAmountCents(totalCents);
  const validTaxBasisPoints = validateBasisPoints(taxBasisPoints);
  // ... existing logic
}

// After (string | number)
function calculateBaseFromTotal(
  totalCents: StringOrNumber, 
  taxBasisPoints: StringOrNumber
): AmountCents {
  const validTotalCents = convertToAmountCents(totalCents);
  const validTaxBasisPoints = convertToBasisPoints(taxBasisPoints);
  // ... existing logic unchanged
}
```

## Error Handling

### String Conversion Errors

New error types for string conversion failures:

- **EmptyStringError**: When string input is empty or whitespace-only
- **InvalidNumberStringError**: When string cannot be converted to a valid number
- **TypeMismatchError**: When input is neither string nor number

### Error Message Enhancement

Error messages will include the original input value for better debugging:

```typescript
// For string inputs that fail conversion
throw new Error(`Total amount "${totalCents}" is not a valid number`);

// For string inputs that fail validation after conversion
throw new Error(`Total amount "${totalCents}" converted to ${converted} exceeds maximum safe value`);
```

### Backward Compatibility

All existing error messages and types remain unchanged when number inputs are used, ensuring no breaking changes for existing code.

## Testing Strategy

### Conversion Testing

1. **Valid String Inputs**: Test common string formats ("123", "123.45", "0.13")
2. **Whitespace Handling**: Test strings with leading/trailing whitespace
3. **Invalid Strings**: Test non-numeric strings, empty strings, special characters
4. **Edge Cases**: Test very large numbers as strings, scientific notation

### Equivalence Testing

1. **Number vs String**: Verify identical results for equivalent number and string inputs
2. **Mixed Inputs**: Test functions with one string and one number parameter
3. **Error Consistency**: Verify same validation errors occur regardless of input type

### Performance Testing

1. **Conversion Overhead**: Measure performance impact of string conversion
2. **Memory Usage**: Verify no memory leaks from string processing
3. **Bulk Operations**: Test performance with arrays of string inputs

### Integration Testing

1. **Real-World Scenarios**: Test with actual form data and API responses
2. **Chain Operations**: Test multiple operations with string inputs
3. **Error Propagation**: Verify error handling through operation chains

## Implementation Notes

### Performance Considerations

- String conversion adds minimal overhead (single Number() call)
- Early conversion means no performance impact on core calculation logic
- Conversion results are not cached to avoid memory overhead

### TypeScript Integration

- Union types (string | number) provide accurate type checking
- Existing code requires no type changes
- New code can use either string or number inputs with full type safety

### Browser Compatibility

- Uses standard JavaScript Number() constructor
- No additional dependencies required
- Compatible with all environments that support the existing library

### Migration Path

1. **Phase 1**: Add string support to validation functions
2. **Phase 2**: Update conversion functions to accept string inputs
3. **Phase 3**: Update calculation functions to accept string inputs
4. **Phase 4**: Add comprehensive tests for string input scenarios
5. **Phase 5**: Update documentation and examples

## Security Considerations

### Input Sanitization

- String inputs are trimmed to remove whitespace
- No eval() or other dynamic code execution
- Conversion uses safe Number() constructor only

### Validation Integrity

- All existing validation rules apply after string conversion
- No relaxed validation for string inputs
- Same overflow and precision checks apply regardless of input type