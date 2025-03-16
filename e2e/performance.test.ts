import { test, expect } from '@playwright/test';

test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
  
  // Check First Contentful Paint
  const fcpEntry = await page.evaluate(() =>
    performance.getEntriesByName('first-contentful-paint')[0]
  );
  expect(fcpEntry.startTime).toBeLessThan(1000);
  
  // Check Largest Contentful Paint
  const lcpEntry = await page.evaluate(() =>
    performance.getEntriesByName('largest-contentful-paint')[0]
  );
  expect(lcpEntry.startTime).toBeLessThan(2500);
});

test('voting performance', async ({ page }) => {
  // Create and join game
  await page.goto('/');
  await page.getByLabel('Number of Players').fill('2');
  await page.getByRole('button', { name: 'Create Game' }).click();
  await page.getByLabel('Your Name').fill('Test Player');
  await page.getByRole('button', { name: 'Join Game' }).click();
  
  // Measure vote submission time
  const startTime = Date.now();
  await page.getByText('5').click();
  await page.getByRole('slider').click();
  await page.getByRole('button', { name: 'Submit Vote' }).click();
  const voteTime = Date.now() - startTime;
  expect(voteTime).toBeLessThan(1000);
  
  // Check animation performance
  const fpsList = await page.evaluate(() => {
    const frames: number[] = [];
    let lastTime = performance.now();
    
    return new Promise(resolve => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fps = 1000 / (entry.startTime - lastTime);
          frames.push(fps);
          lastTime = entry.startTime;
        });
      });
      
      observer.observe({ entryTypes: ['frame'] });
      setTimeout(() => {
        observer.disconnect();
        resolve(frames);
      }, 1000);
    });
  });
  
  const avgFps = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;
  expect(avgFps).toBeGreaterThan(30);
});

test('memory usage', async ({ page }) => {
  await page.goto('/');
  
  const initialMemory = await page.evaluate(() => (performance as any).memory.usedJSHeapSize);
  
  // Create and join game
  await page.getByLabel('Number of Players').fill('2');
  await page.getByRole('button', { name: 'Create Game' }).click();
  await page.getByLabel('Your Name').fill('Test Player');
  await page.getByRole('button', { name: 'Join Game' }).click();
  
  // Submit multiple votes
  for (let i = 0; i < 10; i++) {
    await page.getByText('5').click();
    await page.getByRole('slider').click();
    await page.getByRole('button', { name: 'Submit Vote' }).click();
    await page.getByRole('button', { name: 'Start New Round' }).click();
  }
  
  const finalMemory = await page.evaluate(() => (performance as any).memory.usedJSHeapSize);
  const memoryIncrease = finalMemory - initialMemory;
  
  // Memory increase should be less than 50MB
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
});