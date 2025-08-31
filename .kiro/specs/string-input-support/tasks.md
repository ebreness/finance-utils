# Implementation Plan

- [x] 1. Add string conversion utilities to validation module
  - Create convertToNumber function that handles string | number inputs with trimming and validation
  - Create convertToAmountCents function that converts and validates monetary amounts
  - Create convertToBasisPoints function that converts and validates tax rates
  - Add comprehensive error handling with descriptive messages including original input values
  - Write unit tests for all conversion utilities covering valid strings, invalid strings, whitespace handling, and edge cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 4.3, 4.4_

- [x] 2. Update type definitions for string | number support
  - Add StringOrNumber union type to types.ts ✓ (completed)
  - Update function signatures in calculations.ts to accept StringOrNumber parameters ✓ (completed)
  - Update function signatures in conversions.ts to accept StringOrNumber parameters ✓ (completed)
  - Update AmountCents type to be StringOrNumber for better TypeScript experience
  - Update BasisPoints type to be StringOrNumber for consistency
  - Update function signatures in format.ts to accept StringOrNumber parameters
  - Ensure backward compatibility by maintaining existing number-only behavior
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Enhance validation functions to support string inputs
  - Update validateAmountCents to accept StringOrNumber and use convertToAmountCents internally
  - Update validateBasisPoints to accept StringOrNumber and use convertToBasisPoints internally
  - Update validateNumber to accept StringOrNumber and use convertToNumber internally
  - Maintain all existing validation logic after conversion
  - Write unit tests verifying equivalent behavior for string and number inputs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4, 3.4, 4.2, 5.4_

- [x] 4. Update conversion functions to accept string inputs
  - Modify decimalToCents to accept StringOrNumber for decimalAmount parameter
  - Modify percent100ToBasisPoints to accept StringOrNumber for percentage parameter
  - Modify percent1ToBasisPoints to accept StringOrNumber for percentage parameter
  - Update function implementations to use enhanced validation functions
  - Write unit tests for string inputs to conversion functions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Update calculation functions to accept string inputs
  - Modify calculateBaseFromTotal to accept StringOrNumber for both totalCents and taxBasisPoints
  - Modify calculateTaxFromBase to accept StringOrNumber for both baseCents and taxBasisPoints
  - Modify calculateTaxBreakdown to accept StringOrNumber for both totalCents and taxBasisPoints
  - Update function implementations to use enhanced validation functions
  - Write unit tests for string inputs to calculation functions including mixed string/number scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Add comprehensive error handling tests
  - Write tests for invalid string inputs (non-numeric, empty, malformed numbers)
  - Write tests for string inputs that fail existing validation rules
  - Write tests verifying error messages include original string values
  - Write tests for mixed valid/invalid string and number inputs
  - Verify all existing error handling continues to work for number inputs
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.4_

- [x] 7. Add equivalence and integration tests
  - Write tests verifying identical results for equivalent string and number inputs
  - Write tests for real-world scenarios with form data and API responses
  - Write tests for chains of operations using string inputs
  - Write performance tests to verify minimal overhead from string conversion
  - Add tests to existing test suites to verify backward compatibility
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Update formatting functions to accept string inputs
  - Modify formatCentsWithCurrency to accept StringOrNumber for cents parameter
  - Modify formatCentsToNumber to accept StringOrNumber for cents parameter
  - Update function implementations to use enhanced validation functions
  - Write unit tests for string inputs to formatting functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2_

- [x] 9. Update module exports and documentation
  - Update mod.ts exports to reflect new StringOrNumber parameter types
  - Add JSDoc documentation examples showing string input usage
  - Update existing JSDoc to mention string input support
  - Ensure all exported functions have accurate TypeScript signatures
  - _Requirements: All requirements_