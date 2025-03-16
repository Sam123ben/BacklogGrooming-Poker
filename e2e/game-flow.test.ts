import { test } from '@playwright/test';

// TODO: Fix E2E tests after implementing proper test environment setup
// test('complete game flow', async ({ page }) => {
//   await page.goto('/');
  
//   // Create game
//   await page.getByLabel('Number of Players').fill('2');
//   await page.getByRole('button', { name: 'Create Game' }).click();
  
//   // Verify game URL format
//   expect(page.url()).toMatch(/\/[a-f0-9-]{36}$/);
  
//   // Join game
//   await page.getByLabel('Your Name').fill('Test Player');
//   await page.getByRole('button', { name: 'Join Game' }).click();
  
//   // Wait for game components to load
//   await expect(page.getByText('Test Player')).toBeVisible();
//   await expect(page.getByText('05:00')).toBeVisible();
  
//   // Test card interactions
//   const card = page.getByText('5');
//   await expect(card).toBeVisible();
//   await card.click();
  
//   // Verify confidence slider
//   const slider = page.getByRole('slider');
//   await expect(slider).toBeVisible();
//   await slider.click({ position: { x: 100, y: 0 } });
  
//   // Submit vote
//   await page.getByRole('button', { name: 'Submit Vote' }).click();
//   await expect(page.getByText('✓')).toBeVisible();
// });

// TODO: Fix test after implementing proper error handling
// test('game not found handling', async ({ page }) => {
//   await page.goto('/invalid-game-id');
//   await expect(page.getByText('Game Not Found')).toBeVisible();
//   await expect(page.getByRole('button', { name: 'Create New Game' })).toBeVisible();
// });

// TODO: Fix test after implementing proper player limit handling
// test('player limit enforcement', async ({ browser }) => {
//   // Create game with 2 players
//   const context1 = await browser.newContext();
//   const page1 = await context1.newPage();
//   await page1.goto('/');
//   await page1.getByLabel('Number of Players').fill('2');
//   await page1.getByRole('button', { name: 'Create Game' }).click();
  
//   const gameUrl = page1.url();
  
//   // Fill all slots
//   await page1.getByLabel('Your Name').fill('Player 1');
//   await page1.getByRole('button', { name: 'Join Game' }).click();
  
//   const context2 = await browser.newContext();
//   const page2 = await context2.newPage();
//   await page2.goto(gameUrl);
//   await page2.getByLabel('Your Name').fill('Player 2');
//   await page2.getByRole('button', { name: 'Join Game' }).click();
  
//   // Try to join with a third player
//   const context3 = await browser.newContext();
//   const page3 = await context3.newPage();
//   await page3.goto(gameUrl);
  
//   // Verify game is full
//   await expect(page3.getByText('Game Not Found')).toBeVisible();
  
//   // Cleanup
//   await context1.close();
//   await context2.close();
//   await context3.close();
// });