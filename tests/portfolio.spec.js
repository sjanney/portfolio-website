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

});
