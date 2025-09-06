import { test, expect } from '@playwright/test';

test.describe('Alan Watts AI Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main interface correctly', async ({ page }) => {
    // Check header
    await expect(page.locator('text=Alan Watts AI + Reference Archive')).toBeVisible();
    
    // Check chat interface
    await expect(page.locator('text=Sum1NamedAlan')).toBeVisible();
    await expect(page.locator('text=Hello! I\'m Sum1namedAlan')).toBeVisible();
    
    // Check input field
    await expect(page.locator('input[placeholder*="Ask about Alan"]')).toBeVisible();
  });

  test('should handle tab switching', async ({ page }) => {
    // Start on Books tab
    await expect(page.locator('.tab.active')).toContainText('Books');
    
    // Switch to KQED tab
    await page.click('text=KQED');
    await expect(page.locator('.tab.active')).toContainText('KQED');
    
    // Check content updates
    await expect(page.locator('text=Eastern Wisdom & Modern Life')).toBeVisible();
  });

  test('should send chat messages and receive responses', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about Alan"]');
    const sendButton = page.locator('button:has-text("Send")');
    
    // Type a message
    await chatInput.fill('What is the wisdom of insecurity?');
    
    // Send message
    await sendButton.click();
    
    // Check message appears in chat
    await expect(page.locator('text=What is the wisdom of insecurity?')).toBeVisible();
    
    // Wait for response (with timeout)
    await expect(page.locator('text=Sum1namedAlan is contemplating')).toBeVisible();
    
    // Response should appear eventually
    await expect(page.locator('.chat-message')).toHaveCount(3, { timeout: 10000 }); // Initial + user + AI response
  });

  test('should show AI recommendations', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about Alan"]');
    
    // Send a message that should trigger recommendations
    await chatInput.fill('I feel anxious all the time');
    await page.keyboard.press('Enter');
    
    // Wait for response and check for recommendations
    await page.waitForSelector('text=💡 Sum1namedAlan suggests', { timeout: 15000 });
    await expect(page.locator('text=💡 Sum1namedAlan suggests')).toBeVisible();
  });

  test('should maintain input focus during conversation', async ({ page }) => {
    const chatInput = page.locator('input[placeholder*="Ask about Alan"]');
    
    await chatInput.fill('Hello');
    await page.keyboard.press('Enter');
    
    // Input should regain focus after sending
    await expect(chatInput).toBeFocused();
  });

  test('should handle theme toggle', async ({ page }) => {
    // Only test if theme toggle is visible (desktop view)
    const themeToggle = page.locator('button[title*="Switch to"]');
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.getAttribute('html', 'data-theme');
      
      // Click toggle
      await themeToggle.click();
      
      // Theme should change
      const newTheme = await page.getAttribute('html', 'data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should resize chat panel on desktop', async ({ page }) => {
    // Only test on desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Check if resizer is present
    const resizer = page.locator('[style*="cursor: col-resize"]');
    if (await resizer.isVisible()) {
      const chatPanel = page.locator('[style*="width: 450px"]');
      await expect(chatPanel).toBeVisible();
      
      // Could add drag interaction test here if needed
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/watts-chat', route => {
      route.abort('failed');
    });
    
    const chatInput = page.locator('input[placeholder*="Ask about Alan"]');
    await chatInput.fill('Test message');
    await page.keyboard.press('Enter');
    
    // Should show error message
    await expect(page.locator('text=cosmic machinery')).toBeVisible();
  });
});