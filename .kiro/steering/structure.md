# Project Structure

## Root Level Files
- `mod.ts` - Main module entry point (JSR convention)
- `jsr.json` - Package configuration for JSR registry
- `README.md` - Project documentation

## Directory Organization
- `.git/` - Git version control
- `.kiro/` - Kiro AI assistant configuration
  - `.kiro/steering/` - AI assistant steering rules
  - `.kiro/specs/` - Feature specifications and implementation plans
    - `.kiro/specs/finance-calculations/` - Finance utility library specification
- `.vscode/` - VS Code editor configuration
- `src/` - Source code directory (if needed for larger modules)
- `tests/` - Test files directory

## File Naming Conventions
- Use `mod.ts` as the main entry point (JSR standard)
- TypeScript files use `.ts` extension
- Follow kebab-case for file names when creating additional modules
- Test files should end with `.test.ts` or be in a `tests/` directory

## Module Organization for Finance Library
- Keep the main export in `mod.ts`
- Organize by functionality:
  - `calculations.ts` - Core financial calculation functions
  - `formatting.ts` - Number and currency formatting utilities
  - `types.ts` - TypeScript type definitions
  - `validation.ts` - Input validation functions
  - `constants.ts` - Financial constants (basis points scale, etc.)
- Use explicit exports in `mod.ts` to control the public API

## Best Practices
- Maintain a clean root directory
- Use TypeScript for type safety
- Follow JSR packaging guidelines
- Keep configuration files at the root level
- Separate concerns: calculations, formatting, validation
- Include comprehensive tests for all financial functions
- Document precision requirements and limitations