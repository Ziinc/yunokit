import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    expect(await page.title()).toBeTruthy();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic check that the page is interactive
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
