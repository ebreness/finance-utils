# Technology Stack

## Runtime & Language
- **Language**: TypeScript
- **Target Runtime**: Modern JavaScript environments (Deno, Node.js, browsers)
- **Package Registry**: JSR (JavaScript Registry)

## Configuration Files
- `jsr.json`: Package configuration and metadata for JSR publication
- `mod.ts`: Main module entry point (follows Deno/JSR conventions)

## Development Standards
- Use TypeScript for all source code
- Follow JSR naming conventions (`mod.ts` as entry point)
- Maintain compatibility with modern JavaScript runtimes
- Use strict type checking for financial calculations
- Implement comprehensive input validation for financial functions

## Financial Calculation Standards
- **Precision**: Always work with integers (cents) internally
- **Percentages**: Use basis points (1 bp = 0.01%) for tax calculations
- **Rounding**: Only round at final display step, never during intermediate calculations
- **Validation**: Strict input validation for all financial parameters
- **Safety**: Check for integer overflow using Number.MAX_SAFE_INTEGER

## Common Commands
Since this is a JSR project, typical commands would include:
```bash
# Publish to JSR (requires JSR CLI)
jsr publish

# Type checking (if using Deno)
deno check mod.ts

# Type checking (if using TypeScript compiler)
tsc --noEmit

# Run tests (if using Deno)
deno test

# Run tests (if using Node.js)
npm test
```

## Dependencies
- Managed through `jsr.json` for JSR-compatible packages
- May use `import` statements with JSR specifiers (`jsr:@scope/package`)
- Minimal external dependencies to maintain reliability for financial calculations