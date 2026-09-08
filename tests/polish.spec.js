const { test, expect } = require('@playwright/test');

const sitePages = [
  '/index.html',
  '/bio.html',
  '/work.html',
  '/work-detail.html',
  '/contact.html',
  '/projects.html',
  '/dev-work.html',
  '/dev-huginn.html',
  '/dev-learned-indexes.html',
  '/construction.html',
  '/success.html',
  '/404.html',
];

async function waitForPolish(page) {
  const link = page.locator('link[data-site-polish]');
  await expect(link).toHaveCount(1);
  await expect.poll(() => link.evaluate((element) => Boolean(element.sheet))).toBe(true);
}

test.describe('Site polish', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('permissionsPrompted', 'false'));
  });

  test('rendered site pages contain no emoji or decorative arrow glyphs', async ({ page }) => {
    for (const path of sitePages) {
      await page.goto(path);
      await waitForPolish(page);
      const text = await page.locator('body').innerText();
      expect(text, path).not.toMatch(/[\p{Extended_Pictographic}←↑→↓↖↗↘↙↻]/u);
    }
  });

  test('dynamic Huginn controls stay free of decorative glyphs', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    await waitForPolish(page);
    const next = page.locator('#model-next');
    await expect(next).toBeEnabled();
    await next.click();
    await expect.poll(() => next.innerText()).not.toMatch(/[←↑→↓↖↗↘↙↻]/);
  });

  for (const width of [320, 390, 768]) {
    test(`Mobile layouts stay inside the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of sitePages) {
        await page.goto(path);
        await waitForPolish(page);
        const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
        expect(fits, `${path} at ${width}px`).toBe(true);
      }
    });
  }

  test('Huginn gets two explanatory animated examples', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    await waitForPolish(page);
    const signal = page.locator('#signal-example');
    const causal = page.locator('#causal-example');
    await expect(signal).toBeVisible();
    await expect(causal).toBeVisible();

    await signal.scrollIntoViewIfNeeded();
    await expect.poll(async () => signal.evaluate((el) => el.classList.contains('is-visible'))).toBe(true);
    await causal.scrollIntoViewIfNeeded();
    await expect.poll(async () => causal.evaluate((el) => el.classList.contains('is-visible'))).toBe(true);

    await expect(signal).toContainText('conceptual animation');
    await expect(causal).toContainText('Decodable is not the same as causal');
  });

  test('New examples respect reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dev-huginn.html');
    await waitForPolish(page);
    await expect(page.locator('#signal-example')).toBeVisible();
    await expect(page.locator('#causal-example')).toBeVisible();
    const animations = await page.locator('.polish-example').evaluateAll((elements) =>
      elements.flatMap((element) => element.getAnimations({ subtree: true })).length
    );
    expect(animations).toBe(0);
  });
});
