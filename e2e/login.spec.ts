import { test, expect } from '@playwright/test';
import { getByTestId, waitForAppReady } from './utils';

test.describe('Login flow (robust selectors)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('user can login and reach dashboard', async ({ page }) => {
    const username = getByTestId(page, 'login-username');
    const password = getByTestId(page, 'login-password');
    const submit = getByTestId(page, 'login-submit');

    await expect(username).toBeVisible();
    await username.fill('testuser@example.com');

    await expect(password).toBeVisible();
    await password.fill('supersecret');

    // Use Promise.all to wait for navigation triggered by submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      submit.click(),
    ]);

    // Assert we're on dashboard by a stable test id
    const dashboardHeading = getByTestId(page, 'dashboard-heading');
    await expect(dashboardHeading).toBeVisible();
    await expect(dashboardHeading).toContainText('Dashboard');
  });
});
