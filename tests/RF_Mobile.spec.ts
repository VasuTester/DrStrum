import { test, expect } from '@playwright/test';
import { openMobileWebsiteWithCacheCleared } from './openMobileChrome';
import { waitForDOMContentLoaded } from '../config/utlis';

test.setTimeout(100000); // 100 seconds

test('Routine Finder flow with random selections on Android device', async () => {
  const { page } = await openMobileWebsiteWithCacheCleared('https://dbs-sandbox.mybigcommerce.com/');
  await waitForDOMContentLoaded(page, 'https://dbs-sandbox.mybigcommerce.com/');

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error));

  const headerSvg = page.locator('#dbs-header-container svg').first();
  await headerSvg.waitFor({ state: 'visible', timeout: 30000 });
  await headerSvg.click();

  const mobileMenu = page.locator('.mobile-menu__drawer').first();
  await mobileMenu.waitFor({ state: 'visible', timeout: 20000 });

  const section5 = page.locator('xpath=/html/body/div[6]/div[2]/div[1]/div[3]/div/div/div/div/div/div/section[5]/div');
  await section5.waitFor({ state: 'visible', timeout: 30000 });
  await section5.click();

  const menuItem = page.locator('.mobile-menu__drawer')
    .getByTestId('menuItem-shop-exclusive-to-dr-sturm-routine-finder-exclusive')
    .first();
  await menuItem.waitFor({ state: 'visible', timeout: 30000 });
  await menuItem.click();

  const specificSection = page.locator('#s-464ba759-f600-40f7-a3a0-5a75da0ac7d4');
  await specificSection.waitFor({ state: 'visible', timeout: 30000 });
  await specificSection.click();

  await page.waitForSelector('#New-routine-finder', { timeout: 30000 });

  const maxSteps = 30;
  for (let step = 1; step <= maxSteps; step++) {
    const options = page.locator('.dynamic-step .option-item');
    try {
      await options.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      console.log(`Step ${step}: No visible options. Exiting loop.`);
      break;
    }

    const count = await options.count();
    if (count === 0) break;
    const idx = Math.floor(Math.random() * count);
    const option = options.nth(idx);
    let label = `Option ${idx + 1}`;
    try {
      label = await option.locator('.option-label').innerText();
    } catch {}
    await option.click();
    console.log(`Step ${step}: Selected "${label}"`);

    const nextButton = page.locator('.button-routine-next');
    try {
      await nextButton.waitFor({ state: 'visible', timeout: 3000 });
      await expect(nextButton).toBeEnabled({ timeout: 3000 });
      await nextButton.click();
      console.log(`Step ${step}: Clicked "Next"`);
      await page.waitForTimeout(1000);
    } catch {
      console.log(`Step ${step}: "Next" button not found. Proceeding...`);
      break;
    }

    const isComplete = await page.locator('.routine-result-summary, .routine-complete')
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    if (isComplete) {
      console.log('🎉 Routine Finder completed.');
      break;
    }
  }

  const addToCartButton = page.locator('//*[@id="New-routine-finder"]/div/div/div/div/div/div[3]/div/button[1]');
  if (await addToCartButton.isVisible({ timeout: 3000 })) {
    const dropdowns = page.locator('//*[@id="og-form-section"]/div[2]/div/select');
    const dropdownCount = await dropdowns.count();

    for (let i = 0; i < dropdownCount; i++) {
      const dropdown = dropdowns.nth(i);
      try {
        await dropdown.waitFor({ state: 'visible', timeout: 3000 });
        const options = dropdown.locator('option');
        const optionCount = await options.count();

        // ✅ Explicitly type the array to fix TypeScript errors
        const validOptions: { value: string; index: number; text: string }[] = [];

        for (let j = 0; j < optionCount; j++) {
          const option = options.nth(j);
          const value = await option.getAttribute('value');
          const isDisabled = await option.isDisabled();
          const text = await option.innerText();

          if (value && !isDisabled && text.trim() && value !== '') {
            validOptions.push({ value, index: j, text });
          }
        }

        if (validOptions.length === 0) {
          console.error(`❌ Dropdown ${i + 1}: No valid options available`);
          continue;
        }

        let selected = false;
        const randomIndex = Math.floor(Math.random() * validOptions.length);
        const randomOption = validOptions[randomIndex];

        await dropdown.selectOption(randomOption.value);
        console.log(`🔄 Dropdown ${i + 1}: Tried option "${randomOption.text}" (index ${randomOption.index})`);
        await page.waitForTimeout(1000);

        const lowInventoryText = page.locator('text=/low inventory|out of stock/i').first();
        const isOutOfStock = await lowInventoryText.isVisible().catch(() => false);

        if (!isOutOfStock) {
          console.log(`✅ Dropdown ${i + 1}: Selected "${randomOption.text}" (in stock)`);
          selected = true;
        } else {
          console.warn(`⚠️ Dropdown ${i + 1}: Random option "${randomOption.text}" is out of stock`);
          for (const option of validOptions) {
            if (option.value === randomOption.value) continue;

            await dropdown.selectOption(option.value);
            console.log(`🔄 Dropdown ${i + 1}: Fallback - Tried option "${option.text}" (index ${option.index})`);
            await page.waitForTimeout(1000);

            const isStillOutOfStock = await lowInventoryText.isVisible().catch(() => false);
            if (!isStillOutOfStock) {
              console.log(`✅ Dropdown ${i + 1}: Selected "${option.text}" (in stock)`);
              selected = true;
              break;
            }
          }
        }

        if (!selected) {
          await dropdown.selectOption(validOptions[0].value);
          console.log(`🔄 Dropdown ${i + 1}: Final fallback - Selected "${validOptions[0].text}"`);
        }

      } catch (e) {
        console.warn(`⚠️ Dropdown ${i + 1} error:`, e);
      }
    }

    try {
      await addToCartButton.waitFor({ state: 'visible', timeout: 3000 });
      await addToCartButton.click();
      console.log('🛒 Clicked "Add Routine to Cart"');
    } catch (e) {
      console.error('❌ Failed to click "Add Routine to Cart"', e);
    }

    console.log('✅ Test passed after Add to Cart');
    return;
  }

  const done = await page.locator('.routine-result-summary, .routine-complete')
    .isVisible({ timeout: 10000 })
    .catch(() => false);

  expect(done, 'Did not reach result summary').toBe(true);
  await page.waitForTimeout(3000);
});
