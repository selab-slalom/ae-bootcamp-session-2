# Coding Guidelines

Follow the project's ESLint configuration as the source of truth for code style. Frontend code uses the `react-app` and `react-app/jest` presets, so keep changes consistent with those rules rather than adding conflicting conventions. Linting runs automatically as a pre-push hook; resolve any reported issues before pushing changes.

Prefer clear, maintainable code and apply the DRY principle: avoid duplicating logic or UI, and reuse existing functions and components where that makes behavior easier to understand and maintain. When similar code appears in multiple places, consider whether a shared implementation would reduce inconsistency without obscuring the intent.