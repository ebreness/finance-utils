# Implementation Plan

-
  1. [x] Set up project configuration and core types
  - Create jsr.json with package configuration for JSR publication
  - Create TypeScript type definitions for AmountCents, BasisPoints,
    DecimalAmount
  - Define interfaces for TaxCalculationResult and FormatOptions
  - Set up constants file with mathematical constants and defaults
  - _Requirements: 1.1, 1.2, 2.1, 3.1_

-
  2. [x] Implement input validation functions
  - Create validateAmountCents function with comprehensive error checking
  - Create validateBasisPoints function with range validation
  - Implement checkSafeOperation function for overflow detection
  - Write unit tests for all validation functions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

-
  3. [x] Implement basic conversion functions
- [x] 3.1 Create decimal to cents conversion
  - Implement decimalToCents function with precision handling
  - Write unit tests for decimal to cents conversion
  - _Requirements: 1.1_

- [x] 3.2 Create cents to decimal conversion
  - Implement centsToDecimal function returning exactly 2 decimal places
  - Write unit tests for cents to decimal conversion
  - _Requirements: 1.2_

- [x] 3.3 Create percentage to basis points conversions
  - Implement percent100ToBasisPoints function for 0-100 range
  - Implement percent1ToBasisPoints function for 0-1 range
  - Write unit tests for percentage to basis points conversions
  - _Requirements: 1.3, 1.4_

- [x] 3.4 Create basis points to percentage conversions
  - Implement basisPointsToPercent100 function returning 0-100 range
  - Implement basisPointsToPercent1 function returning 0-1 range
  - Write unit tests for basis points to percentage conversions
  - _Requirements: 1.5, 1.6_

-
  4. [x] Implement formatting functions
- [x] 4.1 Create number formatting functions
  - Implement formatCentsToNumber function returning number with 2 decimals
  - Implement formatPercentToNumber function with 2 decimal precision
  - Write unit tests for number formatting functions
  - _Requirements: 2.1, 2.4_

- [x] 4.2 Create currency formatting function
  - Implement formatCentsWithCurrency with default $ symbol and en-US locale
  - Add support for custom currency symbols and locales
  - Write unit tests for currency formatting with various locales
  - _Requirements: 2.2, 2.3_

- [x] 4.3 Create percentage formatting and clamping functions
  - Implement formatPercentWithSymbol function adding % symbol
  - Implement clampPercent01 function for 0-1 range
  - Implement clampPercent0100 function for 0-100 range
  - Write unit tests for percentage formatting and clamping
  - _Requirements: 2.5, 2.7_

-
  5. [x] Implement safe arithmetic operations
- [x] 5.1 Create basic arithmetic functions
  - Implement safe addition function for monetary amounts
  - Implement safe subtraction function for monetary amounts
  - Implement safe multiplication function with proper rounding
  - Write unit tests for arithmetic operations
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5.2 Add overflow protection
  - Integrate checkSafeOperation calls in arithmetic functions
  - Add comprehensive error handling for integer overflow
  - Write unit tests for overflow detection and error handling
  - _Requirements: 4.4, 4.5_

-
  6. [x] Implement tax calculation functions
- [x] 6.1 Create tax amount calculation from base
  - Implement calculateTaxFromBase function using basis points
  - Ensure exact precision in tax calculations
  - Write unit tests for tax amount calculations
  - _Requirements: 5.1, 5.2_

- [x] 6.2 Create base amount calculation from total with taxes
  - Implement calculateBaseFromTotal function using the core algorithm
  - Ensure base + tax equals original total exactly
  - Add comprehensive input validation and error handling
  - Write unit tests including the specific 32,000 example
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 6.3 Create comprehensive tax breakdown function
  - Implement calculateTaxBreakdown returning complete breakdown
  - Integrate all validation and precision checks
  - Write unit tests for complete tax breakdown scenarios
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

-
  10. [x] Add calculateTaxBreakdown function and export
- [x] 10.1 Implement calculateTaxBreakdown function
  - Add calculateTaxBreakdown function to calculations.ts
  - Function should return TaxCalculationResult with baseAmountCents, taxAmountCents, and totalAmountCents
  - Use existing calculateBaseFromTotal and calculateTaxFromBase functions internally
  - Add comprehensive input validation and error handling
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 10.2 Export calculateTaxBreakdown from mod.ts
  - Add calculateTaxBreakdown to the exports in mod.ts
  - Add JSDoc documentation for the function
  - _Requirements: All requirements_

- [x] 10.3 Add tests for calculateTaxBreakdown
  - Write unit tests for calculateTaxBreakdown function
  - Test the specific 32,000 example from requirements
  - Test edge cases and error conditions
  - Verify exact precision requirements are met
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

-
  7. [x] Update main module exports
  - Update mod.ts to export all implemented functions
  - Organize exports by functionality (conversions, formatting, calculations)
  - Add comprehensive JSDoc documentation for all exported functions
  - _Requirements: All requirements_

-
  8. [x] Add comprehensive integration tests
  - Create real-world financial calculation test scenarios
  - Test chains of operations maintaining precision
  - Verify formatting consistency with calculated values
  - Test edge cases with maximum safe integer values
  - _Requirements: All requirements_

-
  9. [x] Create tax calculation module
- [x] 9.1 Create calculations.ts file with tax calculation functions
  - Implement calculateTaxFromBase function using basis points
  - Implement calculateBaseFromTotal function using the core algorithm
  - Ensure exact precision in tax calculations where base + tax equals original total
  - Add comprehensive input validation and error handling
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 9.2 Add comprehensive tax calculation tests
  - Write unit tests for calculateTaxFromBase function
  - Write unit tests for calculateBaseFromTotal function including the specific 32,000 example
  - Test edge cases and error conditions
  - Verify exact precision requirements are met
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 9.3 Update module exports for tax calculations
  - Export tax calculation functions from mod.ts
  - Add JSDoc documentation for tax calculation functions
  - Update integration tests to include tax calculation scenarios
  - _Requirements: All requirements_
