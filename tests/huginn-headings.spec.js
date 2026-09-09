const { test, expect } = require('@playwright/test');

test.describe('Huginn human headings', () => {
  test('keeps the main title and humanizes the academic section language', async ({ page }) => {
    await page.goto('/dev-huginn.html');

    await expect(page.locator('h1')).toHaveText('Probing Recurrent Reasoning: Inside Huginn’s Hidden States');

    const headings = [
      ['#background > h2', 'The monitoring question'],
      ['#frontier-context > h2', 'Why this matters for current model monitoring'],
      ['#why-huginn > h2', 'Why Huginn is a useful testbed'],
      ['#method > h2', 'Designing a task with known latent structure'],
      ['#trajectory > h2', 'When linear decodability emerges'],
      ['#monitors > h2', 'Comparing state and rationale observability'],
      ['#patching > h2', 'Testing whether the decoded signal is causally used'],
      ['#limits > h2', 'What the current result does and does not show'],
      ['#resources > h2', 'Materials and reproducibility'],
    ];

    for (const [selector, text] of headings) {
      await expect(page.locator(selector)).toHaveText(text);
    }

    await expect(page.locator('#background > h2').nth(1)).toHaveText('Why probe accuracy is not enough');
    await expect(page.locator('#background > h2').nth(2)).toHaveText('Recurrence as a controlled compute intervention');

    await expect(page.locator('.article-contents a[href="#background"]')).toHaveText('Monitoring question');
    await expect(page.locator('.article-contents a[href="#trajectory"]')).toHaveText('Decodability');
    await expect(page.locator('.article-contents a[href="#patching"]')).toHaveText('Causal test');

    await expect(page.locator('#architecture-explorer-title')).toHaveText('How recurrent computation changes with depth');
    await expect(page.locator('#signal-example-title')).toHaveText('Where state and rationale observability diverge');
    await expect(page.locator('#causal-example-title')).toHaveText('What changes under counterfactual state patching');
  });
});
