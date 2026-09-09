const { test, expect } = require('@playwright/test');

test.describe('Huginn human headings', () => {
  test('keeps the main title and humanizes the rest of the page', async ({ page }) => {
    await page.goto('/dev-huginn.html');

    await expect(page.locator('h1')).toHaveText('Probing Recurrent Reasoning: Inside Huginn’s Hidden States');

    const headings = [
      ['#background > h2', 'What I actually wanted to know'],
      ['#frontier-context > h2', 'Why this question matters more now'],
      ['#why-huginn > h2', 'Why Huginn was the right testbed'],
      ['#method > h2', 'I needed ground truth inside the task'],
      ['#trajectory > h2', 'The interesting part is when the signal appears'],
      ['#monitors > h2', 'Then the simple story falls apart'],
      ['#patching > h2', 'So I tried to make the signal matter'],
      ['#limits > h2', 'The null result changed what I think this means'],
      ['#resources > h2', 'Everything behind the result'],
    ];

    for (const [selector, text] of headings) {
      await expect(page.locator(selector)).toHaveText(text);
    }

    await expect(page.locator('#background > h2').nth(1)).toHaveText('A good probe can still fool you');
    await expect(page.locator('#background > h2').nth(2)).toHaveText('Huginn gives me a clean compute dial');

    await expect(page.locator('.article-contents a[href="#background"]')).toHaveText('What I wanted to know');
    await expect(page.locator('.article-contents a[href="#trajectory"]')).toHaveText('Where the signal appears');
    await expect(page.locator('.article-contents a[href="#patching"]')).toHaveText('Does the signal matter?');

    await expect(page.locator('#architecture-explorer-title')).toHaveText('What changes with another recurrent pass');
    await expect(page.locator('#signal-example-title')).toHaveText('Where the state pulls away from the written rationale');
    await expect(page.locator('#causal-example-title')).toHaveText('Did swapping the state actually move the answer?');
  });
});
