import { test, expect } from '@playwright/test';

test('sign in page shows marketing banner', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.locator('text=Content Management Reimagined')).toBeVisible();
});
