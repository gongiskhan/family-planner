import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#root');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await expect(this.root).toBeVisible();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png` });
  }

  async checkAccessibility() {
    // Basic accessibility checks
    await expect(this.page.locator('h1, h2, h3, h4, h5, h6')).toBeVisible();
    
    // Check for proper landmark roles
    const landmarks = ['main', 'navigation', 'banner', 'contentinfo'];
    for (const landmark of landmarks) {
      const landmarkElements = this.page.locator(`[role="${landmark}"], ${landmark}`);
      const count = await landmarkElements.count();
      if (count > 0) {
        await expect(landmarkElements.first()).toBeVisible();
      }
    }
  }

  async checkMobileResponsiveness() {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForLoad();
    
    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForLoad();
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1200, height: 800 });
    await this.waitForLoad();
  }
}