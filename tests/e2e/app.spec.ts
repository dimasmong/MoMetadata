import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('MoMetadata E2E Application Tests', () => {
  test('Landing page displays header, title, privacy explanation, and format badges', async ({ page }) => {
    await page.goto('/');

    // Check header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('MoMetadata').first()).toBeVisible();

    // Check main title and tagline
    await expect(page.getByRole('heading', { name: 'MoMetadata' })).toBeVisible();

    // Check privacy badge
    await expect(page.getByText('Local In-Browser Processing').first()).toBeVisible();

    // Check upload dropzone button
    await expect(page.getByRole('button', { name: 'Browse Files' })).toBeVisible();

    // Check supported format badges
    await expect(page.getByText('JPEG').first()).toBeVisible();
    await expect(page.getByText('PNG').first()).toBeVisible();
    await expect(page.getByText('PDF').first()).toBeVisible();
  });

  test('Uploads file and transitions into interactive 3-column workspace', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.resolve('tests/e2e/fixtures/sample-photo.jpg');

    await fileInput.setInputFiles(fixturePath);

    // Workspace should now be active
    await expect(page.getByText('Loaded Files').first()).toBeVisible();
    await expect(page.getByText('sample-photo.jpg').first()).toBeVisible();

    // Verify preview and metadata details appear
    await expect(page.getByText('File Preview & Summary')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'All Metadata' })).toBeVisible();

    // Verify real metadata was detected
    await expect(page.getByText('Location & GPS Coordinates')).toBeVisible();
    await expect(page.getByText('View on OpenStreetMap')).toBeVisible();
  });

  test('Toggles localization between English and Bahasa Indonesia seamlessly', async ({ page }) => {
    await page.goto('/');

    // Switch to ID
    const langButton = page.getByTitle(/Switch Language/i);
    await langButton.click();

    // Verify Indonesian labels
    await expect(page.getByText('Pemrosesan Lokal di Peramban').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pilih Berkas' })).toBeVisible();

    // Switch back to EN
    await langButton.click();
    await expect(page.getByText('Local In-Browser Processing').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Files' })).toBeVisible();
  });

  test('Toggles between Light and Dark mode with persistent HTML class', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTitle(/Light Mode|Dark Mode/i);

    // Initial state: light mode (no dark class on html)
    const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isInitiallyDark).toBe(false);

    // Click theme toggle
    await themeToggle.click();

    // Should now have dark class
    const isNowDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isNowDark).toBe(true);

    // Toggle back
    await themeToggle.click();
    const isLightAgain = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isLightAgain).toBe(false);
  });

  test('Searches and inspects fields in All Metadata tab', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve('tests/e2e/fixtures/sample-photo.jpg'));

    // Switch to All Metadata tab
    await page.getByRole('tab', { name: 'All Metadata' }).click();

    // Search for Artist
    const searchInput = page.getByPlaceholder(/Search metadata keys/i);
    await searchInput.fill('Artist');

    await expect(page.getByText('Dimas Mong').first()).toBeVisible();

    // Toggle raw view
    await page.getByTitle('Raw Table View').click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('Edits metadata fields and verifies modified file', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve('tests/e2e/fixtures/sample-photo.jpg'));

    // Switch to Edit Metadata tab
    await page.getByRole('tab', { name: 'Edit Metadata' }).click();

    // Fill Title
    const titleInput = page.locator('#edit-title');
    await titleInput.fill('E2E Automated Title');

    // Click Save Modified Copy
    const saveButton = page.getByRole('button', { name: 'Save Modified Copy' });
    await saveButton.click();

    // Verify success banner and download modified button appear
    await expect(page.getByText(/Verification passed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download Modified File' })).toBeVisible();
  });

  test('Removes GPS metadata and displays verified report', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve('tests/e2e/fixtures/sample-photo.jpg'));

    // Switch to Remove Metadata tab
    await page.getByRole('tab', { name: 'Remove Metadata' }).click();

    // Preset A: Remove GPS is selected by default
    await expect(page.getByText('Preset A: Remove GPS & Location')).toBeVisible();

    // Execute Clean
    const cleanButton = page.getByRole('button', { name: 'Clean File Metadata' });
    await cleanButton.click();

    // Verification Report must appear with PASS
    await expect(page.getByText('Verification Report')).toBeVisible();
    await expect(page.getByText(/Target metadata was completely removed/i)).toBeVisible();
  });

  test('Opens format compatibility modal', async ({ page }) => {
    await page.goto('/');

    const compButton = page.getByTitle('Format Compatibility');
    await compButton.click();

    await expect(page.getByRole('heading', { name: 'Format Compatibility Registry' })).toBeVisible();
    await expect(page.getByText('Lossless metadata modification only')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByRole('heading', { name: 'Format Compatibility Registry' })).not.toBeVisible();
  });
});
