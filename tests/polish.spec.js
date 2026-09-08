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

  test('Huginn gets two data-backed evidence interactions', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    await waitForPolish(page);

    const signal = page.locator('#signal-example');
    const causal = page.locator('#causal-example');
    await expect(signal).toBeVisible();
    await expect(causal).toBeVisible();

    await expect(signal).toContainText('paired held-out measurements');
    await expect(signal).not.toContainText('conceptual animation');
    await expect(signal.locator('[data-evidence-depth="16"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(signal.locator('[data-readout="state"]')).toHaveText('91.9%');
    await expect(signal.locator('[data-readout="text"]')).toHaveText('43.2%');
    await expect(signal.locator('[data-readout="task"]')).toHaveText('50.0%');

    await signal.locator('[data-evidence-depth="32"]').click();
    await expect(signal.locator('[data-readout="state"]')).toHaveText('86.5%');
    await expect(signal.locator('[data-readout="task"]')).toHaveText('47.3%');
    await expect(signal.locator('[data-readout="insight"]')).toContainText('43.2 percentage points above');

    await expect(causal).toContainText('measured patching effects');
    await expect(causal.locator('[data-evidence-loop="16"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(causal.locator('[data-patch-readout="counterfactual"]')).toHaveText('+0.0020');
    await expect(causal.locator('[data-patch-readout="control"]')).toHaveText('-0.0082');

    await causal.locator('[data-evidence-loop="32"]').click();
    await expect(causal.locator('[data-patch-readout="counterfactual"]')).toHaveText('+0.0176');
    await expect(causal.locator('[data-patch-readout="control"]')).toHaveText('+0.0045');
    await expect(causal.locator('[data-patch-readout="insight"]')).toContainText('0 / 24');
  });

  test('New evidence interactions respect reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dev-huginn.html');
    await waitForPolish(page);
    await expect(page.locator('#signal-example')).toBeVisible();
    await expect(page.locator('#causal-example')).toBeVisible();

    await page.locator('[data-evidence-depth="32"]').click();
    await page.locator('[data-evidence-loop="32"]').click();
    const animations = await page.locator('.polish-example').evaluateAll((elements) =>
      elements.flatMap((element) => element.getAnimations({ subtree: true })).length
    );
    expect(animations).toBe(0);
  });
});
