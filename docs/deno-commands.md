# Deno Commands

This document provides a comprehensive list of Deno commands for working with the finance-calculations library.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Commands](#development-commands)
- [Testing Commands](#testing-commands)
- [Type Checking](#type-checking)
- [Formatting and Linting](#formatting-and-linting)
- [Publishing](#publishing)
- [Running Examples](#running-examples)

## Prerequisites

Make sure you have Deno installed. You can install it from [deno.land](https://deno.land/manual/getting_started/installation).

```bash
# Check Deno version
deno --version
```

## Development Commands

### Run the Module

```bash
# Import and run the main module
deno run mod.ts

# Run with import map (if you have one)
deno run --import-map=import_map.json mod.ts

# Run with network permissions (if needed for dependencies)
deno run --allow-net mod.ts
```

### Interactive REPL

```bash
# Start Deno REPL
deno repl

# In the REPL, you can import and test functions:
# > import { calculateTaxFromBase, formatCentsWithCurrency } from "./mod.ts"
# > const tax = calculateTaxFromBase(100000, 1300)
# > console.log(formatCentsWithCurrency(tax))
```

## Testing Commands

### Run All Tests

```bash
# Run all test files
deno test

# Run tests with verbose output
deno test --verbose

# Run tests and show coverage
deno test --coverage=coverage

# Generate coverage report
deno coverage coverage
```

### Run Specific Test Files

```bash
# Run a specific test file
deno test tests/calculations.test.ts

# Run multiple specific test files
deno test tests/calculations.test.ts tests/format.test.ts

# Run tests matching a pattern
deno test tests/*arithmetic*
```

### Run Tests with Filtering

```bash
# Run only tests containing "tax" in the name
deno test --filter="tax"

# Run tests excluding integration tests
deno test --filter="^(?!.*integration).*$"

# Run tests with specific permissions
deno test --allow-read --allow-write
```

### Watch Mode for Tests

```bash
# Run tests in watch mode (re-run on file changes)
deno test --watch

# Watch specific test files
deno test --watch tests/calculations.test.ts
```

## Type Checking

### Check Types

```bash
# Type check the main module
deno check mod.ts

# Type check all TypeScript files
deno check src/*.ts

# Type check with strict mode
deno check --strict mod.ts

# Type check without running
deno check --no-run mod.ts
```

### Check Dependencies

```bash
# Show dependency tree
deno info mod.ts

# Check for outdated dependencies
deno info --json mod.ts

# Reload and check dependencies
deno check --reload mod.ts
```

## Formatting and Linting

### Format Code

```bash
# Format all TypeScript files
deno fmt

# Format specific files
deno fmt src/calculations.ts src/format.ts

# Check formatting without making changes
deno fmt --check

# Format with custom configuration
deno fmt --config deno.json
```

### Lint Code

```bash
# Lint all files
deno lint

# Lint specific files
deno lint src/calculations.ts

# Lint with specific rules
deno lint --rules-tags=recommended

# Show lint rules
deno lint --rules
```

## Publishing

### Prepare for Publishing

```bash
# Check if the module is ready for publishing
deno check mod.ts

# Run all tests before publishing
deno test

# Format code before publishing
deno fmt

# Lint code before publishing
deno lint
```

### Publish to JSR

```bash
# Publish to JSR (requires JSR CLI)
jsr publish

# Dry run to see what would be published
jsr publish --dry-run

# Publish with specific version
jsr publish --version 1.0.1
```

### Bundle for Distribution

```bash
# Bundle the module into a single file
deno bundle mod.ts dist/finance-utils.js

# Bundle with import map
deno bundle --import-map=import_map.json mod.ts dist/finance-utils.js
```

## Running Examples

### Create and Run Example Scripts

Create example files to test functionality:

```bash
# Create an example file
cat > example.ts << 'EOF'
import {
  calculateTaxFromBase,
  calculateBaseFromTotal,
  formatCentsWithCurrency,
  decimalToCents,
  percent100ToBasisPoints
} from "./mod.ts";

// Example: Calculate tax on $1000 at 13%
const baseAmount = decimalToCents(1000);
const taxRate = percent100ToBasisPoints(13);
const taxAmount = calculateTaxFromBase(baseAmount, taxRate);

console.log(`Base: ${formatCentsWithCurrency(baseAmount)}`);
console.log(`Tax: ${formatCentsWithCurrency(taxAmount)}`);
console.log(`Total: ${formatCentsWithCurrency(baseAmount + taxAmount)}`);

// Example: Reverse calculation
const total = decimalToCents(1130);
const base = calculateBaseFromTotal(total, taxRate);
console.log(`\nReverse calculation:`);
console.log(`Total: ${formatCentsWithCurrency(total)}`);
console.log(`Base: ${formatCentsWithCurrency(base)}`);
EOF

# Run the example
deno run example.ts
```

### Performance Testing

```bash
# Create a performance test
cat > performance.ts << 'EOF'
import { calculateTaxFromBase, decimalToCents, percent100ToBasisPoints } from "./mod.ts";

const iterations = 1000000;
const baseAmount = decimalToCents(1000);
const taxRate = percent100ToBasisPoints(13);

console.time("Tax calculations");
for (let i = 0; i < iterations; i++) {
  calculateTaxFromBase(baseAmount, taxRate);
}
console.timeEnd("Tax calculations");
EOF

# Run performance test
deno run performance.ts
```

## Useful Development Workflows

### Complete Development Cycle

```bash
# 1. Format code
deno fmt

# 2. Lint code
deno lint

# 3. Type check
deno check mod.ts

# 4. Run tests
deno test

# 5. Run tests with coverage
deno test --coverage=coverage
deno coverage coverage

# 6. Check module info
deno info mod.ts
```

### Continuous Integration Script

Create a CI script:

```bash
cat > ci.sh << 'EOF'
#!/bin/bash
set -e

echo "🔍 Type checking..."
deno check mod.ts

echo "🧹 Checking formatting..."
deno fmt --check

echo "📏 Linting..."
deno lint

echo "🧪 Running tests..."
deno test --coverage=coverage

echo "📊 Generating coverage report..."
deno coverage coverage

echo "✅ All checks passed!"
EOF

chmod +x ci.sh
./ci.sh
```

### Watch Mode for Development

```bash
# Watch for changes and run tests
deno test --watch

# Watch for changes and type check
deno check --watch mod.ts

# Watch and format on save (using external tool like watchexec)
# Install watchexec first: https://github.com/watchexec/watchexec
watchexec --exts ts --ignore coverage -- deno fmt
```

## Environment Variables

### Useful Deno Environment Variables

```bash
# Disable color output
NO_COLOR=1 deno test

# Set custom cache directory
DENO_DIR=/custom/cache/dir deno run mod.ts

# Enable debug logging
DENO_LOG=debug deno run mod.ts

# Set TypeScript compiler options
DENO_TYPESCRIPT_CONFIG=tsconfig.json deno run mod.ts
```

## Troubleshooting Commands

### Clear Cache

```bash
# Clear the entire Deno cache
deno cache --reload mod.ts

# Clear cache for specific modules
deno cache --reload=https://deno.land/std mod.ts

# Show cache location
deno info --json mod.ts | grep "local"
```

### Debug Issues

```bash
# Run with debug information
deno run --log-level=debug mod.ts

# Show detailed error information
deno run --unstable --allow-all mod.ts

# Check permissions
deno run --allow-read --allow-write --log-level=info mod.ts
```

### Upgrade Deno

```bash
# Upgrade to latest version
deno upgrade

# Upgrade to specific version
deno upgrade --version 1.40.0

# Check for available updates
deno upgrade --dry-run
```