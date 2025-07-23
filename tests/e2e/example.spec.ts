import { test, expect } from '@playwright/test';

test.describe('Family Task Manager', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page).toHaveTitle(/Family Task Manager/);
    
    // Check if the main app container is visible
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#root')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('#root')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('#root')).toBeVisible();
  });
});