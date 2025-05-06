import { Page } from '@playwright/test';

/**
 * Waits for DOMContentLoaded event on the given page.
 * @param page Playwright Page object
 * @param url Optional URL to navigate to.
 */
export async function waitForDOMContentLoaded(page: Page, url?: string): Promise<void> {
  if (url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } else {
    await page.waitForFunction(() => {
      return document.readyState === 'interactive' || document.readyState === 'complete';
    });
  }

  console.log('✅ DOMContentLoaded event has fired.');
}
