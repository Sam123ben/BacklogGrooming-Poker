import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Page, Browser, chromium } from '@playwright/test';

let browser: Browser;
let page: Page;

Given('I am on the home page', async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

When('I set the number of players to {int}', async (players: number) => {
  await page.getByLabel('Number of Players').fill(String(players));
});

When('I click the {string} button', async (buttonText: string) => {
  await page.getByRole('button', { name: buttonText }).click();
});

Then('I should see the join game screen', async () => {
  await expect(page.getByText('Join Game')).toBeVisible();
});

Given('a game exists with {int} players', async (players: number) => {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.getByLabel('Number of Players').fill(String(players));
  await page.getByRole('button', { name: 'Create Game' }).click();
});

Given('I am on the join game screen', async () => {
  await expect(page.getByText('Join Game')).toBeVisible();
});

When('I enter my name as {string}', async (name: string) => {
  await page.getByLabel('Your Name').fill(name);
});

When('I select an avatar', async () => {
  await page.getByRole('button').filter({ has: page.locator('img[alt="Avatar"]') }).first().click();
});

Then('I should see the waiting screen', async () => {
  await expect(page.getByText('Waiting for Players')).toBeVisible();
});

Given('all players have joined', async () => {
  // Simulate second player joining
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(page.url());
  await page2.getByLabel('Your Name').fill('Player 2');
  await page2.getByRole('button', { name: 'Join Game' }).click();
});

When('I select card {string}', async (value: string) => {
  await page.getByText(value).click();
});

When('I set confidence to {int}', async (confidence: number) => {
  await page.getByRole('slider').fill(String(confidence));
});

Then('my vote should be recorded', async () => {
  await expect(page.getByText('✓')).toBeVisible();
});

Then('I should see a checkmark next to my name', async () => {
  await expect(page.locator('text="Test Player"').locator('xpath=..').getByText('✓')).toBeVisible();
});

Given('I am in an active game', async () => {
  await page.waitForSelector('text=5:00');
});

When('I click the theme toggle', async () => {
  await page.getByRole('button', { name: 'Toggle theme' }).click();
});

When('I select {string} theme', async (theme: string) => {
  await page.getByText(theme).click();
});

Then('the page should have dark mode styles', async () => {
  await expect(page.locator('html')).toHaveClass(/dark/);
});

When('the timer starts', async () => {
  await page.waitForSelector('text=5:00');
});

Then('I should see the countdown', async () => {
  await expect(page.getByText(/\d:\d\d/)).toBeVisible();
});

When('I click the pause button', async () => {
  await page.getByRole('button', { name: 'Pause timer' }).click();
});

Then('the timer should stop', async () => {
  const time = await page.locator('text=/\\d:\\d\\d/').textContent();
  await page.waitForTimeout(1000);
  expect(await page.locator('text=/\\d:\\d\\d/').textContent()).toBe(time);
});

When('I click the resume button', async () => {
  await page.getByRole('button', { name: 'Resume timer' }).click();
});

Then('the timer should continue counting down', async () => {
  const time1 = await page.locator('text=/\\d:\\d\\d/').textContent();
  await page.waitForTimeout(1000);
  const time2 = await page.locator('text=/\\d:\\d\\d/').textContent();
  expect(time1).not.toBe(time2);
});

After(async () => {
  await browser?.close();
});