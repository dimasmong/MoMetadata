import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function main() {
  console.log('Starting preview server...');
  const server = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4173'], {
    stdio: 'pipe',
    shell: false
  });

  server.stdout.on('data', (d) => console.log(`[server] ${d.toString().trim()}`));
  server.stderr.on('data', (d) => console.error(`[server err] ${d.toString().trim()}`));

  // Wait 3 seconds for server to start
  await new Promise(r => setTimeout(r, 3000));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Evaluate Light Mode computed styles
  const lightStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    const htmlClasses = document.documentElement.className;
    const header = document.querySelector('header');
    const headerBg = header ? window.getComputedStyle(header).backgroundColor : null;
    const heroH1 = document.querySelector('h1');
    const heroH1Color = heroH1 ? window.getComputedStyle(heroH1).color : null;
    return {
      bodyBg: computed.backgroundColor,
      bodyColor: computed.color,
      htmlClasses,
      headerBg,
      heroH1Color
    };
  });

  console.log('Light Mode Styles:', lightStyles);

  // Capture Light Mode Homepage
  await page.screenshot({ path: 'screenshots/light-homepage.png', fullPage: false });
  console.log('Captured screenshots/light-homepage.png');

  // Capture Light Mode FAQ & Footer
  const faqSection = await page.$('#faq-section');
  if (faqSection) {
    await faqSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/light-faq-footer.png' });
    console.log('Captured screenshots/light-faq-footer.png');
  }

  // Scroll back to workspace / top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Click on a sample card to load sample file into workspace
  console.log('Clicking sample card...');
  const sampleCard = page.locator('button:has-text("Sample 1"), button:has-text("JPEG / EXIF")').first();
  if (await sampleCard.count() > 0) {
    await sampleCard.click();
    await page.waitForTimeout(2000);
    console.log('Sample loaded into workspace.');
    await page.screenshot({ path: 'screenshots/light-workspace.png' });
    console.log('Captured screenshots/light-workspace.png');
  } else {
    console.warn('Sample card not found!');
  }

  // 2. Toggle to Dark Mode
  console.log('Toggling theme to Dark Mode...');
  const themeToggle = await page.locator('button[aria-label="Switch to dark mode"], button[title*="dark"], button[title*="Dark"]').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
  } else {
    // Alternatively click the theme toggle button in the header
    const toggleBtn = page.locator('header button').filter({ has: page.locator('svg') }).nth(1);
    await toggleBtn.click();
  }
  await page.waitForTimeout(500);

  // Evaluate Dark Mode computed styles
  const darkStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    const htmlClasses = document.documentElement.className;
    const header = document.querySelector('header');
    const headerBg = header ? window.getComputedStyle(header).backgroundColor : null;
    const heroH1 = document.querySelector('h1');
    const heroH1Color = heroH1 ? window.getComputedStyle(heroH1).color : null;
    return {
      bodyBg: computed.backgroundColor,
      bodyColor: computed.color,
      htmlClasses,
      headerBg,
      heroH1Color
    };
  });

  console.log('Dark Mode Styles:', darkStyles);

  // Capture Dark Mode Workspace
  await page.screenshot({ path: 'screenshots/dark-workspace.png' });
  console.log('Captured screenshots/dark-workspace.png');

  // Scroll to FAQ & Footer in Dark Mode
  if (faqSection) {
    await faqSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/dark-faq-footer.png' });
    console.log('Captured screenshots/dark-faq-footer.png');
  }

  // Scroll to top for Dark Mode Homepage screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/dark-homepage.png' });
  console.log('Captured screenshots/dark-homepage.png');

  // Mobile Viewport Check
  console.log('Testing Mobile Viewport (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/dark-mobile.png' });
  console.log('Captured screenshots/dark-mobile.png');

  // Switch back to light mode on mobile
  const mobileToggle = await page.locator('button[aria-label="Switch to light mode"], button[title*="light"], button[title*="Light"]').first();
  if (await mobileToggle.count() > 0) {
    await mobileToggle.click();
  } else {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mometadata_theme', 'light');
    });
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/light-mobile.png' });
  console.log('Captured screenshots/light-mobile.png');

  await browser.close();
  server.kill();
  console.log('Verification completed successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
