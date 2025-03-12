import { test, expect } from '@playwright/test';

test.describe('Planning Poker Game Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Listen to WebSocket connections
    await context.route('ws://localhost:3001', async route => {
      const ws = await route.request().frame();
      await ws.continue();
    });
  });

  test('complete multiplayer game flow', async ({ browser }) => {
    // First player creates game
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // Create game with 2 players
    await page1.getByLabel('Number of Players').fill('2');
    await page1.getByRole('button', { name: 'Create Game' }).click();
    
    // Get game URL
    const gameUrl = page1.url();
    expect(gameUrl).toMatch(/\/[a-f0-9-]{36}$/);
    
    // First player joins
    await page1.getByLabel('Your Name').fill('Player 1');
    await page1.getByRole('button', { name: 'Join Game' }).click();
    
    // Second player joins in a new context
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(gameUrl);
    await page2.getByLabel('Your Name').fill('Player 2');
    await page2.getByRole('button', { name: 'Join Game' }).click();
    
    // Verify timer is stopped by default
    await expect(page1.getByRole('button', { name: /play|start/i })).toBeVisible();
    await expect(page2.getByRole('button', { name: /play|start/i })).toBeVisible();

    // Start timer
    await page1.getByRole('button', { name: /play|start/i }).click();
    
    // Verify timer is running on both screens
    await expect(page1.getByText(/\d:\d\d/)).toBeVisible();
    await expect(page2.getByText(/\d:\d\d/)).toBeVisible();
    
    // First player votes
    await page1.getByText('5').click();
    await page1.getByRole('slider').click();
    await page1.getByRole('button', { name: 'Submit Vote' }).click();
    
    // Verify vote is recorded and synced
    await expect(page1.getByText('✓')).toBeVisible();
    await expect(page2.locator('text="Player 1"').locator('xpath=..').getByText('✓')).toBeVisible();
    
    // Second player votes
    await page2.getByText('8').click();
    await page2.getByRole('slider').click();
    await page2.getByRole('button', { name: 'Submit Vote' }).click();
    
    // Verify results are shown and synced on both screens
    await expect(page1.getByText('Vote Distribution')).toBeVisible();
    await expect(page2.getByText('Vote Distribution')).toBeVisible();
    
    // Start new round
    await page1.getByRole('button', { name: 'Start New Round' }).click();
    
    // Verify new round started and synced for both players
    await expect(page1.getByText('5')).toBeVisible();
    await expect(page2.getByText('8')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });

  test('game not found handling', async ({ page }) => {
    await page.goto('/invalid-game-id');
    await expect(page.getByText('Game Not Found')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create New Game' })).toBeVisible();
    
    // Test redirect to home
    await page.getByRole('button', { name: 'Create New Game' }).click();
    expect(page.url()).toMatch(/\/$/);
  });

  test('player limit enforcement', async ({ browser }) => {
    // Create game with 2 players
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Number of Players').fill('2');
    await page1.getByRole('button', { name: 'Create Game' }).click();
    
    const gameUrl = page1.url();
    
    // Fill all slots
    await page1.getByLabel('Your Name').fill('Player 1');
    await page1.getByRole('button', { name: 'Join Game' }).click();
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(gameUrl);
    await page2.getByLabel('Your Name').fill('Player 2');
    await page2.getByRole('button', { name: 'Join Game' }).click();
    
    // Try to join with a third player
    const context3 = await browser.newContext();
    const page3 = await context3.newPage();
    await page3.goto(gameUrl);
    
    // Verify game is full
    await expect(page3.getByText('Game Not Found')).toBeVisible();
    
    await context1.close();
    await context2.close();
    await context3.close();
  });

  test('player takeover functionality', async ({ browser }) => {
    // Create and set up game
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Number of Players').fill('2');
    await page1.getByRole('button', { name: 'Create Game' }).click();
    
    const gameUrl = page1.url();
    
    // Join with two players
    await page1.getByLabel('Your Name').fill('Player 1');
    await page1.getByRole('button', { name: 'Join Game' }).click();
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(gameUrl);
    await page2.getByLabel('Your Name').fill('Player 2');
    await page2.getByRole('button', { name: 'Join Game' }).click();
    
    // Take over first player from second player's view
    await page2.getByRole('button', { name: /take over as Player 1/i }).click();
    
    // Verify takeover
    const playerCard = page2.locator('div').filter({ hasText: 'Player 1' }).first();
    await expect(playerCard).toHaveClass(/ring-2/);
    
    await context1.close();
    await context2.close();
  });
});