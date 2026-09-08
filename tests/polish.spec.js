const { test, expect } = require('@playwright/test');

const primaryPages = [
  '/index.html',
  '/bio.html',
  '/work.html',
  '/contact.html',
  '/projects.html',
  '/dev-work.html',
  '/dev-huginn.html',
  '/dev-learned-indexes.html',
];

test.describe('Site polish', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('permissionsPrompted', 'false'));
  });

  test('rendered primary pages contain no emoji or decorative arrow glyphs', async ({ page }) => {
    for (const path of primaryPages) {
      await page.goto(path);
      await expect(page.locator('link[data-site-polish]')).toHaveCount(1);
      const text = await page.locator('body').innerText();
      expect(text, path).not.toMatch(/[\p{Extended_Pictographic}←↑→↓↖↗↘↙↻]/u);
    }
  });

  for (const width of [320, 390, 768]) {
    test(`Mobile layouts stay inside the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of primaryPages) {
        await page.goto(path);
        await expect(page.locator('link[data-site-polish]')).toHaveCount(1);
        const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
        expect(fits, `${path} at ${width}px`).toBe(true);
      }
    });
  }

  test('Huginn gets two explanatory animated examples', async ({ page }) => {
    await page.goto('/dev-huginn.html');
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
    await expect(page.locator('#signal-example')).toBeVisible();
    await expect(page.locator('#causal-example')).toBeVisible();
    const animations = await page.locator('.polish-example').evaluateAll((elements) =>
      elements.flatMap((element) => element.getAnimations({ subtree: true })).length
    );
    expect(animations).toBe(0);
  });
});
