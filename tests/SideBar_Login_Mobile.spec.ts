import { test, chromium, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('Login to DBS Sandbox on real Android device via ADB with Chrome launch', async () => {
  test.setTimeout(120_000); // Extra timeout for device

  // Step 1: Launch Chrome on the Android device via ADB shell
  console.log('🔄 Launching Chrome on the Android device...');
  execSync(`"C:\\Users\\MTPC-353\\Desktop\\Android\\platform-tools\\adb" shell monkey -p com.android.chrome -c android.intent.category.LAUNCHER 1`);

  // Step 2: Forward DevTools port for CDP
  console.log('🔁 Forwarding port 9222 via ADB...');
  execSync(`"C:\\Users\\MTPC-353\\Desktop\\Android\\platform-tools\\adb" forward tcp:9222 localabstract:chrome_devtools_remote`);

  // Step 3: Connect to mobile Chrome via Playwright
  console.log('🧠 Connecting to Chrome DevTools Protocol on device...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  
  // Step 4: Clear cookies before starting the login process
  console.log('🧹 Clearing cookies...');
  await context.clearCookies();

  const page = await context.newPage();

  // Step 5: Navigate to your site
  console.log('🌐 Navigating to login page...');
  await page.goto('https://dbs-sandbox.mybigcommerce.com/', {
    timeout: 60_000,
    waitUntil: 'load',
  });

  // Step 6: Start Login automation
  await page.locator('xpath=//*[@id="dbs-header-container"]/div[1]/div[1]').click();
  const accountBtn = page.locator('xpath=/html/body/div[6]/div[2]/div[1]/div[3]/ul/li[4]/button');
  await accountBtn.waitFor({ state: 'visible', timeout: 40_000 });
  await accountBtn.click();

  await page.locator('xpath=//*[@id="login_email"]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('xpath=//*[@id="login_email"]').fill('ninkal+143@rivenox.com');
  await page.locator('xpath=//*[@id="continueButton"]').click();

  await page.locator('xpath=//*[@id="login_pass"]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('xpath=//*[@id="login_pass"]').fill('testing@123');

  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 40_000 }),
    page.locator('xpath=//*[@id="loginButton"]').click(),
  ]);

  const loginError = await page.locator('text=Invalid email or password').isVisible().catch(() => false);
  if (loginError) {
    throw new Error('❌ Login failed: Invalid email or password.');
  }

  console.log('✅ Login flow completed successfully on real Android device.');

  await browser.close();
});
