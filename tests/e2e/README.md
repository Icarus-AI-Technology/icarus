# E2E Tests with Robust Selectors

This directory contains E2E tests using Playwright with robust, semantic selectors to reduce test flakiness.

## Key Improvements

1. **Semantic Selectors**: Uses `data-testid` attributes instead of fragile CSS selectors
2. **Conditional Waits**: Uses `expect()`, `locator.waitFor()`, and `page.waitForNavigation()` instead of explicit `waitForTimeout()`
3. **Improved Configuration**: Updated timeouts, trace recording, and viewport settings

## Required Frontend Changes

For these tests to work properly, the following components need `data-testid` attributes:

### Core Layout
- `app-shell` - Main application container/shell
- `global-spinner` - Global loading spinner (if exists)

### Login Page
- `login-username` - Username/email input field
- `login-password` - Password input field
- `login-submit` - Login submit button

### Dashboard
- `dashboard-heading` - Main dashboard heading/title
- `cards-list` - Container for dashboard cards/KPIs
- `card-item` - Individual card/KPI element
- `card-details-panel` - Details panel that opens when clicking a card

## Usage

Run tests with:
```bash
npm run test:e2e
```

Run tests in UI mode:
```bash
npm run test:e2e:ui
```

## Test Structure

- `playwright.config.ts` - Test-specific Playwright configuration
- `utils.ts` - Helper functions for robust selectors and app readiness checks
- `login.spec.ts` - Login flow tests with robust selectors
- `dashboard.spec.ts` - Dashboard interaction tests with stable waits

## Notes

- Tests are configured with appropriate timeouts (60s test timeout, 10s action timeout)
- Traces are recorded on first retry for debugging
- Tests use `getByTestId()` helper that works with both old and new Playwright versions
- `waitForAppReady()` helper ensures the app is fully loaded before assertions
