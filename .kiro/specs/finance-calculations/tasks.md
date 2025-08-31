# Implementation Plan

-
  1. [x] Update tax calculation functions to guarantee exact precision
  - Modify calculateBaseFromTotal to ensure base + tax = total exactly by
    calculating tax as difference
  - Update calculateTaxBreakdown to guarantee exact totals in all scenarios
  - Remove any precision error throwing in favor of intelligent amount
    adjustment
  - Add comprehensive tests to verify exact precision guarantee
  - _Requirements: 5.1, 5.2, 5.3, 5.6, 6.1, 6.2, 6.4, 7.1, 7.2_

-
  2. [x] Update validation functions to remove precision error throwing
  - Remove any PrecisionError throwing from validation functions
  - Update error handling to focus on input validation rather than calculation
    precision
  - Ensure overflow detection remains robust for safe integer operations
  - Update unit tests to reflect new error handling approach
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

-
  3. [x] Add comprehensive exact precision tests
  - Create test suite specifically for exact precision guarantee (base + tax =
    total)
  - Test edge cases where mathematical rounding might cause precision issues
  - Verify that all tax breakdown functions maintain exact totals
  - Add property-based tests to verify precision across random inputs
  - Test the specific example: 3200000 cents total with 13% tax = 2831858 base +
    368142 tax
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

-
  4. [x] Update documentation and examples
  - Update JSDoc comments to emphasize exact precision guarantee
  - Add code examples showing that base + tax = total is always true
  - Update README or documentation to highlight the precision approach
  - Include examples of how the library handles edge cases
  - _Requirements: 7.1, 7.3_

-
  5. [x] Implement discount functionality in type definitions
  - Add TaxCalculationWithDiscountResult interface to types.ts
  - Extend existing TaxCalculationResult to include discount fields
  - Update StringOrNumber type usage for discount parameters
  - Ensure type safety for optional discount parameters
  - _Requirements: 11.1, 11.2, 11.10_

-
  6. [x] Enhance calculateTaxBreakdown function with discount support
  - Modify calculateTaxBreakdown to accept optional discountBasisPoints
    parameter
  - Implement discount calculation algorithm that applies discount to original
    base amount
  - Calculate tax on discounted amount while maintaining exact precision
    guarantee
  - Return appropriate result type based on whether discount is provided
  - Ensure backward compatibility with existing function signature
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

-
  7. [x] Add discount validation and error handling
  - Validate discount basis points input using existing validation patterns
  - Add error handling for discount amounts exceeding base amounts
  - Implement round half up rounding for discount calculations
  - Add overflow protection for discount calculations
  - Ensure descriptive error messages for discount-related failures
  - _Requirements: 11.8, 11.9, 3.1, 3.2, 3.3, 3.4_

-
  8. [x] Create comprehensive tests for discount functionality
  - Write unit tests for calculateTaxBreakdown with discount parameters
  - Test exact precision guarantee with discount applied (discountedBase + tax =
    total)
  - Test edge cases: zero discount, discount equal to base amount, high discount
    rates
  - Verify discount amount and basis points are correctly returned in result
  - Test string input support for discount parameters
  - Add property-based tests for discount calculations
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7, 11.8_

-
  9. [ ] Update exports and documentation for discount features
  - Export new TaxCalculationWithDiscountResult type from mod.ts
  - Update JSDoc comments for calculateTaxBreakdown to document discount
    parameter
  - Add code examples showing discount functionality usage
  - Update main module documentation with discount calculation examples
  - Ensure backward compatibility is clearly documented
  - _Requirements: 11.10, 11.1, 11.2_
