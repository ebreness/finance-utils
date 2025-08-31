# Requirements Document

## Introduction

This finance calculations utility library addresses precision issues in monetary
calculations by working with integer cents and basis points internally, only
rounding at the final display step. The library ensures exact calculations where
base amount + tax amount always equals the total amount, eliminating
floating-point arithmetic errors common in financial applications.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to convert between different monetary and
percentage representations, so that I can work with the most appropriate format
for each calculation.

#### Acceptance Criteria

1. WHEN I provide a decimal amount THEN the system SHALL convert it to integer
   cents
2. WHEN I provide integer cents THEN the system SHALL convert it to decimal
   amount with full precision (N decimal places as needed)
3. WHEN I provide a percentage (0-100 format) THEN the system SHALL convert it
   to basis points
4. WHEN I provide a percentage (0-1 format) THEN the system SHALL convert it to
   basis points
5. WHEN I provide basis points THEN the system SHALL convert it to percentage in
   0-100 format with full precision
6. WHEN I provide basis points THEN the system SHALL convert it to percentage in
   0-1 format with full precision
7. IF the conversion would exceed Number.MAX_SAFE_INTEGER THEN the system SHALL
   throw an error

### Requirement 2

**User Story:** As a developer, I want to format monetary amounts and
percentages for display, so that users see properly formatted values with
configurable precision.

#### Acceptance Criteria

1. WHEN I provide an amount in cents THEN the system SHALL format it as a number
   with exactly 2 decimal places by default
2. WHEN I provide an amount in cents and specify decimal places THEN the system
   SHALL format it with the specified number of decimal places
3. WHEN I provide an amount in cents and currency symbol THEN the system SHALL
   format it with the currency symbol with dollar ($) as the default currency
4. WHEN I specify a locale THEN the system SHALL use that locale for formatting
   (with 'en-US' as default locale)
5. WHEN I provide a percentage value THEN the system SHALL format it as a number
   with exactly 2 decimal places
6. WHEN I provide a percentage value for display THEN the system SHALL format it
   with % symbol at the end
7. WHEN formatting amounts THEN the system SHALL use round half up rounding and
   return a formatted string with 2 decimal places
8. WHEN I need to clamp percentage values THEN the system SHALL provide
   functions to clamp between 0-1 and 0-100 ranges

### Requirement 3

**User Story:** As a developer, I want comprehensive input validation, so that I
can catch errors early and provide meaningful feedback.

#### Acceptance Criteria

1. WHEN inputs are null or undefined THEN the system SHALL throw descriptive
   errors
2. WHEN inputs are not numbers THEN the system SHALL throw descriptive errors
3. WHEN inputs are infinite or NaN THEN the system SHALL throw descriptive
   errors
4. WHEN amounts would cause integer overflow THEN the system SHALL throw
   descriptive errors
5. WHEN tax rates are outside reasonable bounds THEN the system SHALL throw
   descriptive errors

### Requirement 4

**User Story:** As a developer, I want to perform safe arithmetic operations on
monetary amounts with consistent rounding, so that I can add, subtract, and
multiply amounts without precision errors.

#### Acceptance Criteria

1. WHEN I add two amounts in cents THEN the system SHALL return the exact sum in
   cents
2. WHEN I subtract two amounts in cents THEN the system SHALL return the exact
   difference in cents
3. WHEN I multiply an amount by a factor THEN the system SHALL return the result
   using round half up rounding
4. WHEN operations would exceed safe integer limits THEN the system SHALL throw
   an error
5. WHEN I perform multiple operations THEN intermediate results SHALL maintain
   full precision
6. WHEN any rounding is required THEN the system SHALL use round half up (0.5
   rounds up to 1, -0.5 rounds up to 0)
7. WHEN I need to round a value THEN the system SHALL provide a centralized
   rounding function that all calculations use

### Requirement 5

**User Story:** As a developer, I want to calculate tax amounts from base
amounts using mathematical precision, so that I can determine the tax portion
based on exact tax rate calculations.

#### Acceptance Criteria

1. WHEN I provide a base amount in cents and tax rate in basis points THEN the
   system SHALL return the tax amount in cents using round half up rounding
2. WHEN I calculate base amount + calculated tax amount THEN the system SHALL
   return the mathematical result
3. WHEN tax calculations result in fractional cents THEN the system SHALL round
   the tax amount using round half up rounding
4. WHEN multiple tax rates apply THEN the system SHALL handle compound tax
   calculations with round half up rounding at each step
5. WHEN I have a base of 2831858 cents with 13% tax THEN the system SHALL return
   368142 cents tax amount (rounded from 368141.54 using round half up)
6. WHEN performing pure mathematical forward calculations THEN the system SHALL
   prioritize mathematical accuracy of the tax rate

### Requirement 6

**User Story:** As a developer, I want to calculate tax amounts from base
amounts that achieve exact target totals, so that I can determine the tax
portion while maintaining total integrity when I have a predetermined total.

#### Acceptance Criteria

1. WHEN I provide a base amount, tax rate, and target total THEN the system
   SHALL return the tax amount that achieves the exact target total
2. WHEN I calculate base amount + adjusted tax amount THEN the system SHALL
   equal exactly the target total amount
3. WHEN tax calculations would not naturally achieve the target total THEN the
   system SHALL adjust the tax amount to ensure base + tax = target total
   exactly
4. WHEN an adjustment is made THEN the system SHALL include adjustment
   information in the result
5. WHEN I have a base of 2831858 cents with 13% tax and target total of 3200000
   cents THEN the system SHALL return 368142 cents tax amount so that 2831858 +
   368142 = 3200000 exactly
6. WHEN performing forward calculations with a target total THEN the system
   SHALL prioritize achieving the exact total through tax adjustment

### Requirement 7

**User Story:** As a developer, I want to calculate the base amount from a total
amount including taxes using tax adjustment strategy, so that I can split costs
while maintaining exact total integrity.

#### Acceptance Criteria

1. WHEN I provide a total amount in cents and tax rate in basis points THEN the
   system SHALL return a base amount and tax amount that sum exactly to the
   total using tax adjustment strategy
2. WHEN I calculate base amount + tax amount THEN the system SHALL equal exactly
   the original total amount
3. IF the total amount is 12200 cents (122.00) and tax rate is 1300 basis points
   (13%) THEN the system SHALL return 10796 cents (107.96) as base amount and
   1404 cents (14.04) as tax amount where 10796 + 1404 = 12200 exactly
4. WHEN the mathematical calculation results in fractional cents THEN the system
   SHALL adjust the tax amount (not the base amount) to maintain the exact total
5. WHEN an adjustment is made THEN the system SHALL provide the adjustment
   amount and reason in the result
6. WHEN inputs are not finite numbers THEN the system SHALL throw an error with
   descriptive message
7. WHEN inputs are not integers THEN the system SHALL throw an error with
   descriptive message
8. WHEN total amount is negative THEN the system SHALL throw an error with
   descriptive message
9. WHEN tax rate is negative THEN the system SHALL throw an error with
   descriptive message

### Requirement 8

**User Story:** As a developer, I want transparent tax breakdown calculations
with adjustment tracking, so that I can rely on total integrity while
understanding any rounding adjustments made.

#### Acceptance Criteria

1. WHEN I call any reverse tax breakdown function THEN the system SHALL
   guarantee that baseAmountCents + taxAmountCents = totalAmountCents exactly
2. WHEN mathematical precision would result in fractional cents THEN the system
   SHALL adjust the tax amount and report the adjustment
3. WHEN displaying amounts with 2 decimal places THEN the system SHALL ensure
   the displayed base + tax = displayed total
4. WHEN rounding adjustments are made THEN the system SHALL provide the
   adjustment amount and reason in the calculation result
5. WHEN I perform multiple sequential calculations THEN each calculation SHALL
   maintain total integrity independently
6. WHEN no adjustment is needed THEN the system SHALL not include adjustment
   fields in the result
7. WHEN an adjustment is made THEN the system SHALL include adjustment amount
   and explanatory reason in the result

### Requirement 9

**User Story:** As a developer, I want a centralized rounding function that
implements round half up consistently, so that all monetary calculations use the
same rounding algorithm.

#### Acceptance Criteria

1. WHEN I need to round any monetary value THEN the system SHALL provide a
   single rounding function that all calculations use
2. WHEN the fractional part is exactly 0.5 THEN the system SHALL round up (0.5 →
   1, 1.5 → 2, -0.5 → 0, -1.5 → -1)
3. WHEN the fractional part is less than 0.5 THEN the system SHALL round down
4. WHEN the fractional part is greater than 0.5 THEN the system SHALL round up
5. WHEN I provide a positive number like 1.5 THEN the system SHALL return 2
6. WHEN I provide a negative number like -1.5 THEN the system SHALL return -1
   (round half up means toward positive infinity for 0.5)
7. WHEN all library functions need rounding THEN they SHALL use this centralized
   rounding function

### Requirement 10

**User Story:** As a developer, I want structured calculation results that
clearly indicate when adjustments have been made, so that I can provide
transparency in financial reporting and auditing.

#### Acceptance Criteria

1. WHEN a calculation requires no adjustment THEN the system SHALL return a
   result with baseAmountCents, taxAmountCents, and totalAmountCents fields
2. WHEN a calculation requires adjustment THEN the system SHALL return a result
   that additionally includes adjustmentCents and adjustmentReason fields
3. WHEN the adjustment reason is provided THEN it SHALL be a descriptive string
   explaining why the adjustment was necessary
4. WHEN multiple calculations are performed THEN each result SHALL be
   independent and self-contained
5. WHEN I need to audit calculations THEN the result structure SHALL provide all
   necessary information to understand the calculation process
6. WHEN displaying results to users THEN the adjustment information SHALL be
   available for transparency

### Requirement 11

**User Story:** As a developer, I want to calculate tax breakdowns that include
discount information, so that I can provide comprehensive financial breakdowns
that show both tax and discount components with exact precision.

#### Acceptance Criteria

1. WHEN I call calculateTaxBreakdown with discount parameters THEN the system
   SHALL return the discounted amount in cents
2. WHEN I call calculateTaxBreakdown with discount parameters THEN the system
   SHALL return the discount percentage in basis points
3. WHEN a discount is applied THEN the system SHALL calculate the discounted
   base amount before applying taxes
4. WHEN a discount is applied THEN the system SHALL maintain the exact precision
   guarantee where discountedBase + tax = total exactly
5. WHEN I provide a discount rate in basis points THEN the system SHALL apply
   the discount to the original base amount
6. WHEN I provide both tax rate and discount rate THEN the system SHALL apply
   discount first, then calculate tax on the discounted amount
7. WHEN no discount is provided THEN the system SHALL return discount fields as
   zero or omit them from the result
8. WHEN discount calculations result in fractional cents THEN the system SHALL
   use round half up rounding for the discount amount
9. WHEN the discount amount would exceed the base amount THEN the system SHALL
   throw an error with descriptive message
10. WHEN displaying discount information THEN the system SHALL provide both the
    discount amount in cents and the discount rate in basis points
