import type { Page, Locator } from '@playwright/test';

/**
 * Prefer using data-testid attributes in your app. If Playwright's getByTestId is available,
 * it will be used; otherwise fallback to attribute selector.
 */
export function getByTestId(pageOrLocator: Page | Locator, id: string) {
  // page.getByTestId exists in Playwright >=1.28; keep robust fallback
  // @ts-ignore
  if (typeof (pageOrLocator as any).getByTestId === 'function') {
    // @ts-ignore
    return (pageOrLocator as any).getByTestId(id);
  }
  // fallback
  return (pageOrLocator as any).locator(`[data-testid="${id}"]`);
}

/**
 * Wait for the app shell and basic elements to be ready before running assertions.
 * Customize selectors to match your app (e.g. header, main container).
 */
export async function waitForAppReady(page: Page) {
  const main = getByTestId(page, 'app-shell') || page.locator('main');
  await main.waitFor({ state: 'visible', timeout: 15_000 });
  // If there's a network-driven spinner, wait for it to disappear
  const spinner = page.locator('[data-testid="global-spinner"]');
  if (await spinner.count() > 0) {
    await spinner.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
}
