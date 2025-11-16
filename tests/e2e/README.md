# E2E Tests - Stable Selectors and Conditional Waits

This directory contains improved Playwright E2E tests that use stable selectors and conditional waits to reduce flakiness.

## Overview

These tests replace fragile selectors (CSS classes, nth-child, etc.) with stable `data-testid` attributes and explicit timeouts with conditional waits.

## Files

- **playwright.config.ts** - Test configuration with stable timeouts and retry settings
- **utils.ts** - Helper functions for robust test selectors and waits
- **login.spec.ts** - Login flow tests using stable selectors
- **dashboard.spec.ts** - Dashboard tests with conditional waits

## Running Tests

```bash
# Run all E2E tests in this directory
npx playwright test --config=tests/e2e/playwright.config.ts

# Run with UI mode
npx playwright test --config=tests/e2e/playwright.config.ts --ui

# Run specific test file
npx playwright test tests/e2e/login.spec.ts --config=tests/e2e/playwright.config.ts
```

## Key Improvements

### 1. Stable Selectors
- ✅ Uses `data-testid` attributes instead of CSS classes
- ✅ Avoids brittle nth-child or index-based selectors
- ✅ Helper function `getByTestId()` with fallback support

### 2. Conditional Waits
- ✅ No explicit `waitForTimeout()` calls
- ✅ Uses `waitFor({ state: 'visible' })` with proper conditions
- ✅ `waitForAppReady()` helper ensures app is loaded before tests

### 3. Proper Navigation Handling
- ✅ `Promise.all()` pattern for navigation-triggering actions
- ✅ `waitForNavigation({ waitUntil: 'networkidle' })` for page transitions

### 4. Focused Configuration
- ✅ Single browser (Chromium) for reduced maintenance
- ✅ Sensible timeouts: 60s test, 10s action, 30s navigation
- ✅ Retry only in CI (2 retries)

## Frontend Requirements

The following `data-testid` attributes must be added to frontend components:

### App Shell
```tsx
<main data-testid="app-shell">
  {/* App content */}
</main>

{/* Optional loading spinner */}
<div data-testid="global-spinner">
  Loading...
</div>
```

### Login Page
```tsx
<input 
  data-testid="login-username"
  type="email"
  placeholder="Email"
/>

<input 
  data-testid="login-password"
  type="password"
  placeholder="Password"
/>

<button data-testid="login-submit">
  Login
</button>
```

### Dashboard
```tsx
<h1 data-testid="dashboard-heading">
  Dashboard
</h1>

<div data-testid="cards-list">
  <div data-testid="card-item">
    {/* Card content */}
  </div>
  <div data-testid="card-item">
    {/* Card content */}
  </div>
</div>

<div data-testid="card-details-panel">
  Details
</div>
```

## Best Practices

### ✅ DO
- Use `data-testid` for all interactive elements
- Use conditional waits (`waitFor`, `toBeVisible`)
- Use `Promise.all()` for actions that trigger navigation
- Use helper functions from `utils.ts`

### ❌ DON'T
- Use CSS class selectors (they can change)
- Use nth-child or index-based selectors (brittle)
- Use explicit timeouts (`waitForTimeout`)
- Use text-based selectors for critical paths

## Example: Adding a New Test

```typescript
import { test, expect } from '@playwright/test';
import { getByTestId, waitForAppReady } from './utils';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature');
    await waitForAppReady(page);
  });

  test('should interact with element', async ({ page }) => {
    // Use stable selector
    const button = getByTestId(page, 'feature-button');
    
    // Wait for visibility
    await expect(button).toBeVisible();
    
    // Click and wait for result
    const result = getByTestId(page, 'feature-result');
    await Promise.all([
      result.waitFor({ state: 'visible', timeout: 10_000 }),
      button.click(),
    ]);
    
    await expect(result).toContainText('Success');
  });
});
```

## Troubleshooting

### Test fails with "element not found"
- Check that the `data-testid` attribute exists in the component
- Verify the app is fully loaded before running assertions
- Use `waitForAppReady()` in `beforeEach`

### Test is still flaky
- Increase timeout values in specific `waitFor()` calls if needed
- Check for network-driven content and wait for loading states
- Ensure navigation completes before assertions

### Test runs too slowly
- Reduce timeout values if tests are consistently fast
- Check for unnecessary waits
- Consider parallelizing independent tests

## Configuration Details

### Timeouts
- **Test timeout**: 60 seconds (overall test)
- **Expect timeout**: 10 seconds (assertions)
- **Action timeout**: 10 seconds (clicks, fills)
- **Navigation timeout**: 30 seconds (page loads)

### Retry Strategy
- **CI**: 2 retries on failure
- **Local**: 0 retries (fail fast for development)

### Browser
- **Chromium only** (Desktop Chrome 1280x720)
- Other browsers can be added if needed

## Related Documentation

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
