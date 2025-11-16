import { test, expect } from '@playwright/test';
import { getByTestId, waitForAppReady } from './utils';

test.describe('Dashboard (stable waits)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await waitForAppReady(page);
  });

  test('cards load and can open details', async ({ page }) => {
    const cardList = getByTestId(page, 'cards-list');
    await expect(cardList).toBeVisible();

    // Find first card via role/ test id rather than brittle nth selectors
    const firstCard = cardList.locator('[data-testid="card-item"]').first();
    await expect(firstCard).toBeVisible();

    // Click card and wait for details panel to appear
    const detailsPanel = getByTestId(page, 'card-details-panel');
    await Promise.all([
      detailsPanel.waitFor({ state: 'visible', timeout: 10_000 }),
      firstCard.click(),
    ]);

    await expect(detailsPanel).toContainText('Details');
  });
});
