# Step 2-3: Add Testing Guidelines

## Goal
Document clear testing guidelines for the TODO app to ensure code quality and reliability across the project.

## Instructions

#### :keyboard: Activity: Ask Copilot to create testing guidelines

1. Open the **Copilot** chat panel and switch to **Agent** mode using the dropdown menu.
2. Instruct Copilot to create a new file at `docs/testing-guidelines.md` with your testing principles, for example:
   - **Unit tests**: Use Jest to test individual functions and React components in isolation
     - Unit tests should use the naming convention `*.test.js` or `*.test.ts`
     - Backend unit tests should be placed in `packages/backend/__tests__/` directory
     - Frontend unit tests should be placed in `packages/frontend/src/__tests__/` directory
     - Name unit test files to match what they're testing (e.g., `app.test.js` for testing `app.js`)
   - **Integration tests**: Use Jest + Supertest to test **backend API endpoints** with real HTTP requests
     - Integration tests should be placed in `packages/backend/__tests__/integration/` directory
     - Integration tests should also use the naming convention `*.test.js` or `*.test.ts`
     - Name integration test files intelligently based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)
   - **End-to-end (E2E) tests**: Use Playwright (the required framework) to test **complete UI workflows** through browser automation
     - E2E tests should be placed in `tests/e2e/` directory
     - E2E tests should use the naming convention `*.spec.js` or `*.spec.ts`
     - Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`)
   - **Port Configuration**: Always use environment variables with sensible defaults for port configuration
     - Backend: `const PORT = process.env.PORT || 3030;`
     - Frontend: React's default port is 3000, but can be overridden with `PORT` environment variable
     - This allows CI/CD workflows to dynamically detect ports
   - **Playwright tests must use one browser only**
   - **Playwright tests must use the Page Object Model (POM) pattern** for maintainability
   - **Limit E2E tests to 5-8 critical user journeys** - focus on happy paths and key edge cases, not exhaustive coverage
   - **All tests must be isolated and independent** - each test should set up its own data and not rely on other tests
   - **Setup and teardown hooks are required** - tests must succeed on multiple runs
   - Specify that all new features should include appropriate tests
   - Tests should be maintainable and follow best practices
3. Ask Copilot to update `copilot-instructions.md` to reference the new `testing-guidelines.md` file.
4. Commit and push your changes.

#### Success Criteria
- `docs/testing-guidelines.md` exists and contains a summary of `testing-practices.md` plus the requirements for unit, integration, and end-to-end testing.
- `copilot-instructions.md` is updated to reference `testing-guidelines.md`.

If you encounter any issues, you can:
- Review that `docs/testing-guidelines.md` was created and `copilot-instructions.md` was updated
- Double-check that your changes were pushed to the `feature/context` branch
- Ask Copilot to fix specific problems

## Why?
Clear testing guidelines help all contributors maintain high code quality, catch bugs early, and ensure the application works as intended.
