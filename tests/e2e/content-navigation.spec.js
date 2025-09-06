import { test, expect } from '@playwright/test';

test.describe('Content Navigation and Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display books content correctly', async ({ page }) => {
    await page.click('text=Books');
    
    // Check for key books
    await expect(page.locator('text=The Way of Zen')).toBeVisible();
    await expect(page.locator('text=The Wisdom of Insecurity')).toBeVisible();
    await expect(page.locator('text=The Book')).toBeVisible();
    
    // Check for source links
    await expect(page.locator('a:has-text("Open source")')).toHaveCount(22); // All books should have links
  });

  test('should display KQED episodes', async ({ page }) => {
    await page.click('text=KQED');
    
    // Check for key episodes
    await expect(page.locator('text=Man and Nature')).toBeVisible();
    await expect(page.locator('text=The Void')).toBeVisible();
    await expect(page.locator('text=On Death')).toBeVisible();
    
    // Check episode numbers
    await expect(page.locator('text=KQED Episode • 1')).toBeVisible();
  });

  test('should display Essential Lectures', async ({ page }) => {
    await page.click('text=Essential Lectures');
    
    // Check for lectures
    await expect(page.locator('text=Nothingness')).toBeVisible();
    await expect(page.locator('text=Essential Lectures •')).toBeVisible();
  });

  test('should display The Works audio content', async ({ page }) => {
    await page.click('text=The Works');
    
    // Check for audio recordings
    await expect(page.locator('text=Audio Recording •')).toBeVisible();
    
    // Should have many recordings
    const recordings = page.locator('.card:has-text("Audio Recording")');
    await expect(recordings).toHaveCount(373); // Expected number of recordings
  });

  test('should display all content in All tab', async ({ page }) => {
    await page.click('text=All');
    
    // Should see all sections
    await expect(page.locator('h2:has-text("Books")')).toBeVisible();
    await expect(page.locator('h2:has-text("KQED")')).toBeVisible();
    await expect(page.locator('h2:has-text("Essential Lectures")')).toBeVisible();
    await expect(page.locator('h2:has-text("The Works")')).toBeVisible();
  });

  test('should open external links in new tabs', async ({ page }) => {
    await page.click('text=Books');
    
    // Check that links have correct attributes
    const sourceLink = page.locator('a:has-text("Open source")').first();
    await expect(sourceLink).toHaveAttribute('target', '_blank');
    await expect(sourceLink).toHaveAttribute('rel', 'noreferrer');
  });

  test('should display TL;DR link', async ({ page }) => {
    const tldrLink = page.locator('a:has-text("TL;DR")');
    await expect(tldrLink).toBeVisible();
    await expect(tldrLink).toHaveAttribute('href', 'https://app.screencast.com/UkiROLrdG2fyI');
    await expect(tldrLink).toHaveAttribute('target', '_blank');
  });

  test('should show appropriate metadata for each content type', async ({ page }) => {
    // Books should show year
    await page.click('text=Books');
    await expect(page.locator('text=Book • 1951')).toBeVisible();
    
    // KQED should show episode numbers
    await page.click('text=KQED');
    await expect(page.locator('text=KQED Episode • 1')).toBeVisible();
    
    // Essential Lectures should show numbers
    await page.click('text=Essential Lectures');
    await expect(page.locator('text=Essential Lectures •')).toBeVisible();
  });

  test('should handle mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.reload();
    
    // Header should be present
    await expect(page.locator('text=Alan Watts AI + Reference Archive')).toBeVisible();
    
    // Chat should be at bottom
    await expect(page.locator('text=Sum1NamedAlan')).toBeVisible();
    
    // Content should be scrollable
    await page.click('text=Books');
    await expect(page.locator('text=The Way of Zen')).toBeVisible();
  });

  test('should show footer information', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer content
    await expect(page.locator('text=Alan Watts Organization')).toBeVisible();
    await expect(page.locator('text=Sum1 Solutions')).toBeVisible();
    await expect(page.locator('text=AI responses are automated')).toBeVisible();
  });
});