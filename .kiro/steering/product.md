# Product Overview

This is a TypeScript/JavaScript utility library for finance calculations and formatting, configured for publication to JSR (JavaScript Registry).

## Key Characteristics
- Entry point: `mod.ts` (following Deno/JSR conventions)
- Package configuration: `jsr.json`
- TypeScript-based module
- Designed for modern JavaScript runtime environments
- Precision-focused financial calculations

## Purpose
A reusable finance utility library that handles monetary calculations with precision by:
- Working with amounts in cents (integers) to avoid floating-point precision issues
- Using basis points for percentage calculations (1 basis point = 0.01%)
- Always maintaining 2-decimal precision for final results
- Ensuring exact calculations where base amount + tax amount = total amount

## Core Problem Solved
Traditional floating-point arithmetic causes rounding errors in financial calculations. For example:
- Service cost with taxes: 32,000
- Tax rate: 13%
- Cost without taxes: 32,000 / 1.13 = 28,318.5840707965
- When rounded to 28,318.58, recalculating taxes: 28,318.58 * 1.13 = 31,999.9954

This library ensures exact calculations by working in integer cents and basis points, only rounding at the final display step.