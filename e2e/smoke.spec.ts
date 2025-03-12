import { test, expect } from '@playwright/test';

test('basic smoke test @smoke', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  await expect(page).toHaveTitle('Planning Poker');
  await expect(page.getByText('Planning Poker')).toBeVisible();
  
  // Create game
  await page.getByLabel('Number of Players').fill('2');
  await page.getByRole('button', { name: 'Create Game' }).click();

  // Verify game URL format
  expect(page.url()).toMatch(/\/[a-f0-9-]{36}$/);

  // Join game
  await page.getByLabel('Your Name').fill('Test Player');
  await page.getByRole('button', { name: 'Join Game' }).click();

  // Verify game components
  await expect(page.getByText('Test Player')).toBeVisible();
  await expect(page.getByText('5:00')).toBeVisible();
  
  // Test card interactions
  const card = page.getByText('5');
  await expect(card).toBeVisible();
  await card.click();
  
  // Verify confidence slider
  const slider = page.getByRole('slider');
  await expect(slider).toBeVisible();
  await slider.click({ position: { x: 100, y: 0 } });
  
  // Submit vote
  await page.getByRole('button', { name: 'Submit Vote' }).click();
  await expect(page.getByText('✓')).toBeVisible();

  // Test timer functionality
  const timer = page.getByText(/\d:\d\d/);
  await expect(timer).toBeVisible();
  const pauseButton = page.getByRole('button').filter({ has: page.locator('svg') });
  await pauseButton.click();
  const timeAfterPause = await timer.textContent();
  await page.waitForTimeout(1100);
  expect(await timer.textContent()).toBe(timeAfterPause);

  // Verify footer
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('Planning Poker');
  await expect(footer).toContainText(new Date().getFullYear().toString());
});