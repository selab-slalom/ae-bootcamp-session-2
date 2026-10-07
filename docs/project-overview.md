# Project Overview

## Introduction

This project is a full-stack JavaScript application designed as a starter template for the Copilot Bootcamp by Slalom. It consists of a React frontend and a Node.js/Express backend, organized in a monorepo structure using npm workspaces.

## Architecture

The project follows a monorepo architecture with the following structure:

- `packages/frontend/`: React-based web application
- `packages/backend/`: Express.js API server

## Technology Stack

### Frontend
- React
- React DOM
- CSS for styling

### Backend
- Node.js
- Express.js

### Testing
- **Unit Tests**: Test individual functions and React components in isolation using Jest
  - **File Extensions**: `*.test.js` or `*.test.ts`
  - **Backend Location**: `packages/backend/__tests__/`
  - **Frontend Location**: `packages/frontend/src/__tests__/`
  - Name test files to match what they're testing (e.g., `app.test.js` for testing `app.js`)

- **Integration Tests**: Test backend API endpoints with real HTTP requests using Jest + Supertest
  - **File Extensions**: `*.test.js` or `*.test.ts`
  - **Location**: `packages/backend/__tests__/integration/`
  - Name integration test files intelligently based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

- **End-to-End (E2E) Tests**: Test complete UI workflows through browser automation using Playwright
  - **File Extensions**: `*.spec.js` or `*.spec.ts`
  - **Location**: `tests/e2e/`
  - Use Playwright only, and only test with one browser
  - Tests must use Page Object Model (POM) pattern
  - Limit to 5-8 E2E tests covering critical user journeys (focus on quality over quantity) that are isolated and independent from one another
  - Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Playwright browsers (installed automatically with first E2E test run)

### Installation
1. Clone the repository
2. Run `npm install` at the root of the project to install all dependencies
3. Start the development environment using `npm run start`

## Development Workflow

The project uses npm workspaces to manage the monorepo structure. You can:

- Run `npm run start` from the root to start both frontend and backend in development mode
- Run `npm test` from the root to run unit and integration tests for all packages
- Run `npm run test:e2e` to run Playwright end-to-end (UI) tests
- Run `npm run test:all` to run all tests (unit, integration, and E2E)
- Work on individual packages by navigating to their directories and using their specific scripts

## Deployment

General Guidelines, Code Style and Testing Practices will be covered in the bootcamp sessions.
