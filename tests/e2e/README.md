# E2E Tests

This directory contains end-to-end tests for the Icarus ERP system using Playwright.

## Running Tests

To run these tests, use the following command from the project root:

```bash
playwright test --config=tests/e2e/playwright.config.ts
```

Or use the npm script:
```bash
npm run test:e2e
```

## Test Files

- `login.spec.ts` - Tests for login functionality
- `dashboard.spec.ts` - Tests for dashboard functionality
- `utils.ts` - Helper functions for tests
- `playwright.config.ts` - Playwright configuration

## Required Data Test IDs

The frontend components must expose the following `data-testid` attributes for these tests to work:

- `app-shell` - Main app container
- `global-spinner` - Loading spinner
- `login-username` - Login username input
- `login-password` - Login password input
- `login-submit` - Login submit button
- `dashboard-heading` - Dashboard page heading
- `cards-list` - Dashboard cards container
- `card-item` - Individual card elements
- `card-details-panel` - Card details panel
# Documentation update

