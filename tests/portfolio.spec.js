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

  test('Clicking a work section opens work detail page with centered text, under construction status, and GIF', async ({ page }) => {
    await page.goto('/work.html');
    
    // Click on the first work link
    await page.locator('.work-link').first().click();
    
    // Verify URL navigation to work-detail.html
    await expect(page).toHaveURL(/.*work-detail\.html\?id=0/);
    
    // Check title text is centered and visible
    const detailTitle = page.locator('#detailTitle');
    await expect(detailTitle).toBeVisible();
    await expect(detailTitle).toHaveText('slawn on w14th street art gallery opening');

    // Check 'page under construction' notice
    const status = page.locator('.detail-status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText('page under construction');
    
    // Check GIF exists and is visible at bottom
    const gif = page.locator('.detail-gif');
    await expect(gif).toBeVisible();
    await expect(gif).toHaveAttribute('src', /.*via GIPHY-mkaYkiNW\.gif/);

    // Check back link exists
    const backLink = page.locator('.detail-back-link');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveText('← back to work');
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

});
