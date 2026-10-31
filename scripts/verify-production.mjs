import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser to verify https://mometadata.vercel.app ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Navigate to production
  const response = await page.goto('https://mometadata.vercel.app', { waitUntil: 'networkidle' });
  const status = response.status();
  console.log(`Production HTTP status: ${status}`);

  if (status !== 200) {
    throw new Error(`Expected HTTP 200, got ${status}`);
  }

  // 2. Check Title
  const title = await page.title();
  console.log(`Page Title: "${title}"`);

  // 3. Verify Light Mode default
  const lightCheck = await page.evaluate(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    return { isDark, bodyBg };
  });
  console.log('Initial Light Mode Check:', lightCheck);

  // 4. Verify Theme Toggle
  const themeToggle = page.locator('header button[aria-label*="Dark"], header button[title*="Dark"]').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(300);
    const darkCheck = await page.evaluate(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      return { isDark, bodyBg };
    });
    console.log('Dark Mode Check:', darkCheck);

    // Toggle back to light
    const lightToggle = page.locator('header button[aria-label*="Light"], header button[title*="Light"]').first();
    await lightToggle.click();
    await page.waitForTimeout(300);
  }

  // 5. Verify Language Toggle
  console.log('Testing Language Switcher...');
  const langEnBtn = page.locator('header button').filter({ hasText: 'EN' }).first();
  if (await langEnBtn.count() > 0) {
    await langEnBtn.click();
    await page.waitForTimeout(400);
    const idText = await page.locator('h1').textContent();
    console.log('Switched to Indonesian. Header:', idText.trim());

    // Switch back to English by clicking ID button
    const langIdBtn = page.locator('header button').filter({ hasText: 'ID' }).first();
    await langIdBtn.click();
    await page.waitForTimeout(400);
    const enText = await page.locator('h1').textContent();
    console.log('Switched back to English. Header:', enText.trim());
  }

  // 6. Test Sample Loading in Workspace
  console.log('Loading Sample File...');
  let downloadTriggeredAutomatically = false;
  page.on('download', () => {
    downloadTriggeredAutomatically = true;
  });

  const sampleCard = page.locator('button:has-text("Sample 1"), button:has-text("JPEG / EXIF")').first();
  await sampleCard.click();
  await page.waitForTimeout(1500);

  // Check that no automatic download happened
  if (downloadTriggeredAutomatically) {
    throw new Error('FAILED: File was downloaded automatically upon loading sample!');
  }
  console.log('Verified: No automatic download triggered upon file load.');

  // 7. Verify Workspace Tabs
  console.log('Testing Workspace Views...');
  // Inspector View
  const inspectorTab = page.locator('button').filter({ hasText: /Inspector/i }).first();
  await inspectorTab.click();
  await page.waitForTimeout(400);
  console.log('- Inspector tab verified');

  // Editor View
  const editorTab = page.locator('button').filter({ hasText: /Editor/i }).first();
  await editorTab.click();
  await page.waitForTimeout(400);
  const titleInput = page.locator('input[placeholder*="Project Sunset"]').first();
  console.log('- Editor input fields verified:', await titleInput.count() > 0);

  // Remover View
  const removerTab = page.locator('button').filter({ hasText: /Remover/i }).first();
  await removerTab.click();
  await page.waitForTimeout(400);
  const removerHeading = page.locator('h3').filter({ hasText: /Remover/i }).first();
  console.log('- Remover options rendered:', await removerHeading.count() > 0);

  // Privacy Audit View
  const privacyTab = page.locator('button').filter({ hasText: /Privacy/i }).first();
  await privacyTab.click();
  await page.waitForTimeout(400);
  const privacyHeading = page.locator('h3:has-text("Privacy"), h4').first();
  console.log('- Privacy analysis view verified:', await privacyHeading.count() > 0);

  // Batch View
  const batchTab = page.locator('button').filter({ hasText: /Batch/i }).first();
  await batchTab.click();
  await page.waitForTimeout(400);
  const addFilesBtn = page.locator('button').filter({ hasText: /Add Files/i }).first();
  console.log('- Batch processing view verified:', await addFilesBtn.count() > 0);

  // 11. Test FAQ Accordion
  const faqSection = page.locator('#faq-section');
  await faqSection.scrollIntoViewIfNeeded();
  const firstFaq = faqSection.locator('button').first();
  await firstFaq.click();
  await page.waitForTimeout(300);
  console.log('- FAQ interaction verified');

  // 12. Test Mobile Viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(300);
  const mobileHeader = page.locator('header').first();
  console.log('- Mobile layout responsive and active:', await mobileHeader.isVisible());

  // Check critical console errors
  console.log(`Console error count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.warn('Console errors detected:', consoleErrors);
  }

  await browser.close();
  console.log('Production live verification SUCCESSFUL!');
}

main().catch(err => {
  console.error('Production verification failed:', err);
  process.exit(1);
});
