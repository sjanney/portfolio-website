const { test, expect } = require('@playwright/test');

test.describe('Portfolio Website Tests', () => {

  test('Home page loads and hero image exists', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle('Shane Janney — Portfolio');
    
    // Check nav exists and bio is present
    const bioLink = page.locator('.nav-link', { hasText: 'bio' });
    await expect(bioLink).toBeVisible();
    
    // Check hero image is fully visible
    const heroImage = page.locator('#heroImage');
    await expect(heroImage).toBeVisible();
  });

  test('Navigation to work page works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click work link
    await page.locator('.nav-link', { hasText: 'work' }).first().click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*work\.html/);
    await expect(page).toHaveTitle('Shane Janney — Work');
    
    // Check that there are multiple scroll sections
    const sections = page.locator('.work-section');
    expect(await sections.count()).toBeGreaterThan(1);
  });

  test('Work page has lazy loading and optimized webp images', async ({ page }) => {
    await page.goto('/work.html');
    
    // First image shouldn't be lazy
    const firstImage = page.locator('.work-content img').first();
    await expect(firstImage).not.toHaveAttribute('loading', 'lazy');
    await expect(firstImage).toHaveAttribute('src', /.*\.jpeg/);
    
    // Second image should be lazy loaded
    const secondImage = page.locator('.work-content img').nth(1);
    await expect(secondImage).toHaveAttribute('loading', 'lazy');
  });

  test('Footer Grainient renders correctly', async ({ page }) => {
    await page.goto('/work.html');
    
    // Check if footer element exists
    const footer = page.locator('.footer-section');
    await expect(footer).toBeVisible();
    
    // Ensure the webgl canvas was attached
    const canvas = page.locator('#footerGrainient canvas');
    await expect(canvas).toBeAttached();
    
    // Ensure contact links exist
    const instagram = page.getByRole('link', { name: '@shanejanney', exact: true });
    await expect(instagram).toHaveAttribute('href', 'https://instagram.com/shanejanney');
  });

  test('Clicking the Slawn work section opens its photo gallery', async ({ page }) => {
    await page.goto('/work.html');
    
    // Click on the first work link
    await page.locator('.work-link').first().click();
    
    // Verify URL navigation to work-detail.html
    await expect(page).toHaveURL(/.*work-detail\.html\?id=0/);
    
    const gallery = page.locator('#slawnGallery');
    await expect(gallery).toBeVisible();
    await expect(page.locator('.slawn-gallery-title')).toHaveText('slawn on w14th street');
    await expect(page.locator('.slawn-gallery-item')).toHaveCount(20);
    await expect(page.locator('.slawn-gallery-back')).toHaveText('← back to work');

    const firstThumbnailIsSquare = await page.locator('.slawn-gallery-item').first().evaluate(element => {
      const rect = element.getBoundingClientRect();
      return Math.abs(rect.width - rect.height) < 1;
    });
    expect(firstThumbnailIsSquare).toBe(true);

    await page.locator('.slawn-gallery-item').first().click();
    await expect(page.locator('.slawn-lightbox')).toHaveClass(/is-open/);
    await expect(page.locator('.slawn-lightbox-image')).toBeVisible();
  });

  test('Slawn gallery stays usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/work-detail.html?id=0');

    await expect(page.locator('.slawn-gallery')).toBeVisible();
    await expect(page.locator('.slawn-gallery-item')).toHaveCount(20);
    await expect(page.locator('.slawn-gallery-item').first().locator('img'))
      .toHaveAttribute('loading', 'eager');

    const viewportHasNoHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ));
    expect(viewportHasNoHorizontalOverflow).toBe(true);

    await page.locator('.slawn-gallery-item').first().click();
    await expect(page.locator('.slawn-lightbox')).toHaveClass(/is-open/);
    await expect(page.locator('.slawn-lightbox-close')).toHaveCSS('min-width', '44px');
  });

  test('Other work detail pages retain the construction state', async ({ page }) => {
    await page.goto('/work-detail.html?id=1');

    await expect(page.locator('.detail-title')).toHaveText('beardown festival - redveil performance');
    await expect(page.locator('.detail-status')).toHaveText('page under construction');
    await expect(page.locator('.slawn-gallery')).toBeHidden();
  });

  test('Contact page navigation and ReflectiveCard live text sync works', async ({ page }) => {
    await page.goto('/contact.html');

    // Check contact title
    const title = page.locator('.contact-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('get in touch');

    // Check initial default text on ReflectiveCard
    const cardName = page.locator('#cardName');
    const cardEmail = page.locator('#cardEmail');
    const cardSubject = page.locator('#cardSubject');

    await expect(cardName).toHaveText('YOUR NAME');
    await expect(cardEmail).toHaveText('YOUR@EMAIL.COM');
    await expect(cardSubject).toHaveText('PROJECT INQUIRY');

    // Type into form fields and verify live text sync onto card
    await page.fill('#contactName', 'Alex Doe');
    await expect(cardName).toHaveText('ALEX DOE');

    await page.fill('#contactEmail', 'alex@example.com');
    await expect(cardEmail).toHaveText('ALEX@EXAMPLE.COM');

    await page.fill('#contactSubject', 'Custom Design Work');
    await expect(cardSubject).toHaveText('CUSTOM DESIGN WORK');
  });

  test('Mobile layouts stay within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/work.html');

    await expect(page.locator('.nav-link').first()).toBeVisible();
    await expect(page.locator('.work-content').first()).toBeVisible();

    const viewportHasNoHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ));
    expect(viewportHasNoHorizontalOverflow).toBe(true);
  });

  test('Mobile contact page uses the touch-first contact pass', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact.html');

    await expect(page.locator('.mobile-contact-card')).toBeVisible();
    await expect(page.locator('.contact-card-wrapper')).toBeHidden();

    await page.fill('#contactName', 'Alex Doe');
    await expect(page.locator('[data-mobile-preview="name"]')).toHaveText('alex doe');

    const viewportHasNoHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ));
    expect(viewportHasNoHorizontalOverflow).toBe(true);
  });

  test('Projects and dev work pages keep compact responsive layouts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/projects.html');
    await expect(page.locator('.projects-title')).toHaveText('projects');
    await expect(page.locator('.project-item')).toHaveCount(2);

    const projectsHaveNoOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ));
    expect(projectsHaveNoOverflow).toBe(true);

    await page.goto('/dev-work.html');
    await expect(page.locator('.dev-link')).toBeVisible();
    await expect(page.locator('.dev-item-arrow')).toHaveText('↗');

    const devWorkHasNoOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ));
    expect(devWorkHasNoOverflow).toBe(true);
  });

});
