import { test, expect, Page, BrowserContext, Locator } from '@playwright/test';
import { openMobileWebsiteWithCacheCleared } from './openMobileChrome';

const NEXT_BUTTON_SELECTORS: Record<number, string> = {
  1: '#step-1 div:nth-of-type(3) > button',
  2: '#step-2 div:nth-of-type(3) > button:first-of-type',
  3: '#step-3 div:nth-of-type(3) > button:first-of-type',
  4: '#step-4 div:nth-of-type(3) > button:first-of-type',
  5: '#step-5 div:nth-of-type(3) > button:first-of-type',
  6: '#step-6 div:nth-of-type(3) > button:first-of-type',
  7: '#step-7 div:nth-of-type(3) > button:first-of-type',
};

const FINISH_BUTTON_SELECTORS = [
  '#extra div:nth-of-type(3) > button:first-of-type',
  '#step-8 div:nth-of-type(3) > button:first-of-type',
  "button:has-text('Finish')",
];

const ADD_TO_CART_SELECTOR = '#candy-add-to-cart';
const VIEW_CART_SELECTOR = '#candy-error-modal div > section div > div > div > a';

let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
  const result = await openMobileWebsiteWithCacheCleared('https://dbs-sandbox.mybigcommerce.com/build-your-kit');
  context = result.context;
  page = result.page;
  console.log('✅ Mobile browser session initialized via CDP.');
});

test.afterAll(async () => {
  console.log('✅ Test completed.');
  await context.close();
});

async function waitForElement(selector: string, timeout = 8000): Promise<Locator | null> {
  const locator = page.locator(selector);
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  } catch {
    console.warn(`⚠️ Element not found or visible: ${selector}`);
    return null;
  }
}

async function clickElement(selector: string, retries = 3): Promise<boolean> {
  const locator = await waitForElement(selector);
  if (!locator) return false;
  for (let i = 0; i < retries; i++) {
    if (await locator.isEnabled()) {
      await page.screenshot({ path: `before_click_${selector.replace(/\W/g, '_')}.png` });
      await locator.click({ force: true });
      return true;
    }
    await page.waitForTimeout(500);
  }
  return false;
}

async function clickFinishButton(): Promise<boolean> {
  for (const selector of FINISH_BUTTON_SELECTORS) {
    const buttons = page.locator(selector);
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      if (text?.trim().toLowerCase() === 'finish' && await button.isVisible() && await button.isEnabled()) {
        await page.screenshot({ path: 'before_finish_click.png' });
        await button.click({ force: true });
        await page.waitForTimeout(3000);
        return true;
      }
    }
  }
  return false;
}

async function selectAvailableProduct(step: number, clickNext = false) {
  let selected = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const radios = page.locator('input[type="radio"]:not([disabled])');
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      const radio = radios.nth(i);
      const classAttr = await radio.getAttribute('class');
      if (classAttr?.includes('OutOfStock')) continue;
      if (await radio.isVisible() && await radio.isEnabled()) {
        await radio.scrollIntoViewIfNeeded();
        await radio.dispatchEvent('click');
        await radio.evaluate((el: HTMLInputElement) => el.checked = true);
        selected = true;
        break;
      }
    }
    if (selected) break;
    await page.waitForTimeout(1000);
  }

  if (clickNext && NEXT_BUTTON_SELECTORS[step]) {
    await clickElement(NEXT_BUTTON_SELECTORS[step]);
    await page.waitForTimeout(3000);
  }
}

async function processPagesUntilFinish() {
  for (let step = 1; step <= 8; step++) {
    await selectAvailableProduct(step, false);
    if (await clickFinishButton()) return;
    if (NEXT_BUTTON_SELECTORS[step]) await clickElement(NEXT_BUTTON_SELECTORS[step]);
  }
}

async function addToCartAndViewCart() {
  await page.click(ADD_TO_CART_SELECTOR, { timeout: 5000 });
  await page.waitForSelector(VIEW_CART_SELECTOR, { state: 'visible', timeout: 10000 });
  await page.click(VIEW_CART_SELECTOR);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'cart.png' });
}

test('Build and add product to cart on mobile', async () => {
  test.setTimeout(180000);
  await test.step('Mobile Chrome already navigated to build-your-kit', async () => {
    console.log('✅ Already navigated to page via mobile setup.');
  });
  await processPagesUntilFinish();
  await addToCartAndViewCart();
});
