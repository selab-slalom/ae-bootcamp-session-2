# Step 2-6: Review and Validate the Test Suite

## Goal
Review all unit, integration, and end-to-end (E2E) tests generated or modified by GitHub Copilot and ensure they are meaningful, maintainable, and passing.

## Instructions

#### 1. Review the tests
Review the new tests added by Copilot and the updates made to the existing ones. Verify that the generated tests cover the new app behaviors as well as error and edge cases and use mocks appropriately. Watch in particular for AI limitations like:
  - False Positive Tests - Tests that always pass regardless of code correctness​
  - Phantom Assertions - Assertions that check non-existent or wrong conditions​
  - Mock Hallucinations - Mocks that behave unrealistically or that don’t match real behavior​
  - Coverage Illusions - Tests that claim coverage but miss critical paths​

Some helpful sanity checks:
- Can I break the function and make the test fail?
- Are the tests isolated or interdependent?
- Is the data generated realistic for the scenario in which it is used?
- Do integration tests use real wiring (no over-mocking)?
- Do E2E tests validate the complete user journey (not just the happy path)?
- Is the backend state verified (not just UI)? 

#### 2. Run the tests

**2a. Run Unit Tests**

Unit tests run in isolation and don't require the app to be running:
```bash
# Run frontend unit tests
npm run test:frontend

# Run backend unit tests
npm run test:backend

# Or run both
npm test
```

Frontend unit tests cover React components and client-side functions in `packages/frontend/src/__tests__/`. Backend unit tests cover server-side functions and utilities in `packages/backend/__tests__/`.

**2b. Run API Integration Tests**

Integration tests require the backend server to be running:
```bash
# In one terminal, start the backend
npm run start:backend

# In another terminal, run integration tests
npm run test:integration
```

These tests use Jest + Supertest to make real HTTP requests to the API. Tests are located in `packages/backend/__tests__/integration/`.

**2c. Run UI End-to-End Tests**

E2E tests require both frontend and backend to be running:

**Start the full application:**
```bash
npm run start
```

**In a new terminal, run Playwright tests:**
```bash
npm run test:e2e
```

 **Important:** If you make code changes to fix test failures, you must restart the app for E2E tests to see the changes:
 ```bash
 # Stop the app (Ctrl+C in the terminal running npm start)
 # Then restart:
 npm run start
 # In a new terminal, run E2E tests again:
 npm run test:e2e
 ```

 **Tip:** For debugging test failures, you can run Playwright in UI mode (requires local execution):
 ```bash
 npx playwright test --ui
 ```

**Run all tests together:**

To run all test types (unit, integration, and E2E) in sequence:
```bash
npm run test:all
```
 **Note:** This requires both frontend and backend to be running for integration and E2E tests.

**2d. Common Issues and Troubleshooting**

You may find that you need to ask Copilot to fix or strengthen the tests it generated and this may take multiple iterations. Remember to be explicit about the problem and to not accept the changes blindly.

- **If a test fails:**

Better than: "Fix this test."

Use a prompt like: "The test in app.test.js fails with this output: (paste error). Here is the related code in app.js (paste or open). 1) Identify if the test or implementation is wrong. 2) Suggest a minimal fix. 3) Show the updated test snippet only."

- **To strengthen a weak test:**

Better than: "Improve this test."

Use a prompt like: "Review app.test.js. List any assertions that could pass even if the component were broken. Propose stronger assertions tied to UI state changes or text content."

- **To improve coverage**

Better than: "Add more coverage."

Use a prompt like: "Coverage shows `toggleTodo` missing the branch where the item id doesn’t exist. Add a unit test asserting a 404 is returned and the state is unchanged"

- **For setup/teardown issues:**

Better than: "Fix the failing test."

Use a prompt like: "Test passes on first run but fails on second run with 'expected 1 task but found 2'. Add `beforeEach` hook to clear localStorage and sessionStorage, then reload the page. Also add `afterEach` to capture screenshots on failure."

- **For Selector issues:**

Better than: "Fix the selector."

Use a prompt like: "Test fails with 'strict mode violation: locator resolved to 2 elements'. The selector is `getByRole('textbox', { name: 'Title' })`. Show me how to scope this to the dialog only using `locator('role=dialog >> role=textbox')`"

- **For timing issues:**

Better than: "Add waits."

Use a prompt like: "Test fails intermittently when checking for new task. The test clicks 'Add' then immediately checks the list. Add proper `waitFor` to ensure the API call completes before asserting."

**2e. Run with Coverage**

When satisfied by the results, run the entire suite with coverage and verify that it is meeting the testing guidelines:
```bash
npm test -- --coverage
```

#### 3. Commit and push the changes

## Success Criteria
- All tests pass successfully
- Meaningful core coverage
- No fragile/trivial tests


## Why?
A passing test suite that actually asserts correct behavior is critical before expanding features. It is important to validate test quality and not just execution.