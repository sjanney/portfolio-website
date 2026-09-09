const { test, expect } = require('@playwright/test');

test.describe('Huginn research article', () => {
  test('Architecture explorer is detailed, user-driven, and does not autoplay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/dev-huginn.html');

    const figure = page.locator('#architecture-explorer');
    await expect(figure).toBeVisible();
    await expect(page.locator('.model-walkthrough')).toHaveCount(0);
    await expect(figure).toContainText('same parameters every loop');
    await expect(figure).toContainText('hk = Gθ(hk−1, e)');
    await expect(figure.locator('[data-architecture-stage="0"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#architecture-stage-index')).toHaveText('01 / 09');

    await page.waitForTimeout(700);
    await expect(page.locator('#architecture-stage-index')).toHaveText('01 / 09');
    await expect(figure.evaluate(element => element.getAnimations({ subtree: true }).length)).resolves.toBe(0);

    await figure.locator('[data-architecture-stage="3"]').click();
    await expect(page.locator('#architecture-stage-title')).toHaveText('The shared core produces h1');
    await expect(page.locator('#architecture-state')).toHaveText('h1');
    await expect(figure.locator('[data-architecture-node="core"]')).toHaveClass(/is-active/);

    await figure.locator('[data-architecture-stage="6"]').click();
    await expect(page.locator('#architecture-stage-description')).toContainText('R is set to 4, 8, 16, or 32');
    await expect(page.locator('#architecture-fixed')).toContainText('checkpoint and prompt remain the same');
    await expect.poll(() => figure.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test('Architecture depth selector exposes the test-time compute intervention', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/dev-huginn.html');
    const figure = page.locator('#architecture-explorer');
    await expect(figure).toBeVisible();

    await expect(figure.locator('[data-architecture-depth="16"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#architecture-depth-title')).toHaveText('R = 16 · 16 recurrent updates');
    const before = await page.locator('#architecture-depth-marker').evaluate(element => getComputedStyle(element).left);

    await figure.locator('[data-architecture-depth="32"]').click();
    await expect(page.locator('#architecture-depth-title')).toHaveText('R = 32 · 32 recurrent updates');
    await expect(page.locator('#architecture-depth-marker-label')).toHaveText('h32');
    await expect.poll(() => page.locator('#architecture-depth-marker').evaluate(element => getComputedStyle(element).left)).not.toBe(before);

    const depth32 = figure.locator('[data-architecture-depth="32"]');
    await depth32.focus();
    await depth32.press('ArrowLeft');
    await expect(figure.locator('[data-architecture-depth="16"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#architecture-depth-copy')).toContainText('same Gθ parameters');
    await expect.poll(() => figure.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test('Architecture explorer respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dev-huginn.html');
    const figure = page.locator('#architecture-explorer');
    await expect(figure).toBeVisible();
    await figure.locator('[data-architecture-stage="4"]').click();
    await figure.locator('[data-architecture-depth="32"]').click();
    await expect(page.locator('#architecture-state')).toHaveText('h2');
    await expect(page.locator('#architecture-depth-marker-label')).toHaveText('h32');
    expect(await figure.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test('Example motion is finite, interruptible, and settles on the selected data', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/dev-huginn.html');
    await expect(page.locator('[data-depth="4"]')).toBeEnabled();
    await page.locator('[data-depth="4"]').click();
    await expect(page.locator('#latent-bar')).toHaveCSS('transition-property', 'transform');
    await page.locator('[data-depth="32"]').click();
    await page.locator('[data-depth="8"]').click();
    await expect(page.locator('#latent-score')).toHaveText('56.7%');
    await expect.poll(() => page.locator('#latent-bar').evaluate(element => (
      Number(new DOMMatrix(getComputedStyle(element).transform).a.toFixed(4))
    ))).toBe(.567);
    await page.locator('#exception').check();
    await expect.poll(() => page.locator('.chain').evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
    await page.locator('#exception').uncheck();
    await expect(page.locator('#policy-path')).toHaveText('Base rule');
    await page.locator('#patch-loop').selectOption('32');
    await expect(page.locator('#patch-flips')).toHaveText('0 / 24');
    await expect.poll(() => page.locator('.patch-flow').evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
    await expect.poll(() => page.locator('.dev-article').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test('Changing to reduced motion cancels active example animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/dev-huginn.html');
    await expect(page.locator('#patch-loop')).toBeEnabled();
    await page.locator('#patch-loop').selectOption('8');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#exception').check();
    await page.locator('[data-depth="4"]').click();
    await expect(page.locator('#latent-score')).toHaveText('54.6%');
    await expect(page.locator('#latent-bar')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('#trajectory-chart circle')).toHaveCSS('transition-duration', '0s');
    await expect.poll(() => page.locator('.dev-article').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test('Dev work links to the research article and keeps learned indexes', async ({ page }) => {
    await page.goto('/dev-work.html');
    await expect(page.locator('a[href="dev-learned-indexes.html"]')).toBeVisible();
    await page.locator('a[href="dev-huginn.html"]').click();
    await expect(page).toHaveTitle('Probing Recurrent Reasoning: Inside Huginn’s Hidden States — Shane Janney');
    await expect(page.locator('h1')).toContainText('Probing Recurrent Reasoning');
    await expect(page.locator('.dev-article-meta')).toContainText('Shane Janney');
    await expect(page.locator('body')).not.toContainText(/working paper/i);
    await expect(page.locator('body')).not.toContainText('Running it locally');
  });

  test('Illustration keeps the decision path separate from the final answer', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    await expect(page.locator('#policy-path')).toHaveText('Base rule');
    await expect(page.locator('#policy-answer')).toHaveText('Allow');
    await page.locator('#exception').check();
    await expect(page.locator('#policy-path')).toHaveText('Exception');
    await expect(page.locator('#policy-answer')).toHaveText('Deny');
    await page.locator('#badge').uncheck();
    await expect(page.locator('#policy-answer')).toHaveText('Allow');
    await page.locator('#exception').uncheck();
    await expect(page.locator('#policy-answer')).toHaveText('Deny');
  });

  test('Trajectory reads real CSV data and works with the keyboard', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/dev-huginn.html');
    const slider = page.locator('#loop-slider');
    await expect(slider).toBeEnabled();
    await expect(page.locator('#trajectory-chart svg')).toBeVisible();
    await expect(page.locator('#loop-score')).toHaveText('91.9%');
    await slider.focus();
    await slider.press('Home');
    await expect(page.locator('#loop-score')).toHaveText('48.6%');
    await slider.press('End');
    await expect(page.locator('#loop-score')).toHaveText('86.5%');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Loop 32, balanced accuracy 86.5%');
    await slider.fill('18');
    await expect(page.locator('#loop-score')).toHaveText('94.6%');
    expect(errors).toEqual([]);
  });

  test('Comparison uses same-ID cohorts, including shallow depths', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    const cases = [
      [4, '54.6%', '49.1%', '54.3%', 55, '58.1%'],
      [8, '56.7%', '47.1%', '41.5%', 67, '54.1%'],
      [16, '91.9%', '43.2%', '41.9%', 74, '50.0%'],
      [32, '86.5%', '43.2%', '48.6%', 74, '47.3%'],
    ];
    for (const [depth, latent, tfidf, miniLM, count, task] of cases) {
      const button = page.locator(`[data-depth="${depth}"]`);
      await expect(button).toBeEnabled();
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#latent-score')).toHaveText(latent);
      await expect(page.locator('#tfidf-score')).toHaveText(tfidf);
      await expect(page.locator('#minilm-score')).toHaveText(miniLM);
      await expect(page.locator('#cohort-note')).toContainText(`${count} eligible`);
      await expect(page.locator('#task-score')).toHaveText(task);
      await expect(page.locator('#task-ci')).toContainText('all 74 test examples');
    }
  });

  test('Every patch condition keeps zero flips and reports the correct margin', async ({ page }) => {
    await page.goto('/dev-huginn.html');
    await expect(page.locator('#patch-loop')).toBeEnabled();
    for (const loop of ['1', '2', '4', '8', '16', '24', '32']) {
      await page.locator('#patch-loop').selectOption(loop);
      await expect(page.locator('#patch-flips')).toHaveText('0 / 24');
      await expect(page.locator('#patch-upper')).toHaveText('14.2%');
    }
    await expect(page.locator('#patch-margin')).toContainText('0.0176');
    await page.locator('#patch-loop').selectOption('1');
    await expect(page.locator('#patch-margin')).toContainText('0.0007');
  });

  test('Article and default results remain useful when data fails', async ({ page }) => {
    await page.route('**/assets/research/huginn/*.csv', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    await page.goto('/dev-huginn.html');
    await expect(page.locator('.readout-note[role="status"]')).toHaveCount(3);
    await expect(page.locator('#loop-slider')).toBeDisabled();
    await expect(page.locator('#loop-score')).toHaveText('91.9%');
    await expect(page.locator('#monitors h2')).toBeVisible();
    await page.locator('#exception').check();
    await expect(page.locator('#policy-answer')).toHaveText('Deny');
  });

  test('Malformed measurements fail closed without inventing a graph', async ({ page }) => {
    await page.route('**/probe_by_loop.csv', route => route.fulfill({ status: 200, body: 'model,R,loop\ninvalid,32,1\n' }));
    await page.goto('/dev-huginn.html');
    await expect(page.locator('#trajectory-chart [role="status"]')).toBeVisible();
    await expect(page.locator('#loop-slider')).toBeDisabled();
    await expect(page.locator('#trajectory-chart svg')).toHaveCount(0);
    await expect(page.locator('#patch-loop')).toBeEnabled();
  });

  test('Paper, sources, and local navigation targets resolve', async ({ page, request }) => {
    await page.goto('/dev-huginn.html');
    const paths = await page.locator('a[href]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')))]);
    for (const path of paths) {
      if (path.startsWith('#')) {
        await expect(page.locator(path)).toHaveCount(1);
      } else if (!path.startsWith('http')) {
        const response = await request.get(`/${path}`);
        expect(response.status(), path).toBe(200);
        if (path.endsWith('.pdf')) expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
        if (path.endsWith('.zip')) expect((await response.body()).subarray(0, 2).toString()).toBe('PK');
      }
    }
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`Article layout fits ${width}px and reduced motion remains usable`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/dev-huginn.html');
      await expect(page.locator('#loop-slider')).toBeEnabled();
      await expect(page.locator('#architecture-explorer')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const escaping = await page.locator('.dev-article *').evaluateAll(elements => elements.filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width && (rect.right > innerWidth + 1 || rect.left < -1);
      }).map(element => element.tagName));
      expect(escaping).toEqual([]);
      await page.locator('[data-depth="32"]').click();
      await expect(page.locator('#latent-score')).toHaveText('86.5%');
      await page.locator('[data-architecture-depth="32"]').click();
      await expect(page.locator('#architecture-depth-marker-label')).toHaveText('h32');
      await page.locator('#loop-slider').focus();
      await page.locator('#loop-slider').press('Home');
      await expect(page.locator('#loop-score')).toHaveText('48.6%');
    });
  }

  test('Article is readable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://localhost:8080/dev-huginn.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.nav-link').first()).toBeVisible();
    await expect(page.locator('#loop-score')).toHaveText('91.9%');
    await expect(page.locator('noscript p')).toBeVisible();
    await context.close();
  });
});