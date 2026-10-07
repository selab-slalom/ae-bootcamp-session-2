# Testing Guidelines

All new features should include appropriate tests. Tests should be maintainable, follow best practices, and be isolated and independent: each test sets up its own data and does not rely on another test. Required setup and teardown hooks should ensure tests succeed across multiple runs.

## Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Use the file naming convention `*.test.js` or `*.test.ts`.
- Place backend unit tests in `packages/backend/__tests__/`.
- Place frontend unit tests in `packages/frontend/src/__tests__/`.
- Name test files after the code being tested (for example, `app.test.js` for `app.js`).

## Integration Tests

- Use Jest and Supertest to test backend API endpoints with real HTTP requests.
- Place integration tests in `packages/backend/__tests__/integration/`.
- Use the file naming convention `*.test.js` or `*.test.ts`.
- Choose filenames that describe the behavior under test (for example, `todos-api.test.js` for TODO API endpoints).

## End-to-End Tests

- Use Playwright, the required E2E framework, to test complete UI workflows through browser automation.
- Place E2E tests in `tests/e2e/` and use the file naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files after the user journey they test (for example, `todo-workflow.spec.js`).
- Use one browser only and follow the Page Object Model (POM) pattern.
- Limit E2E coverage to 5-8 critical user journeys, focusing on happy paths and key edge cases rather than exhaustive coverage.

## Port Configuration

- Configure ports with environment variables and sensible defaults.
- Backend default: `const PORT = process.env.PORT || 3030;`.
- The frontend uses React's default port, `3000`, which can be overridden with the `PORT` environment variable.
- Environment-based ports allow CI/CD workflows to detect ports dynamically.